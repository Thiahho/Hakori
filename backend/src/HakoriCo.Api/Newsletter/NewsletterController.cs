using System.Text.RegularExpressions;
using HakoriCo.Api.Data;
using HakoriCo.Api.Newsletter.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Newsletter;

[ApiController]
[Route("api/newsletter")]
public partial class NewsletterController(
    AppDbContext db,
    IResendClient resend,
    IConfiguration config,
    ILogger<Contact> logger) : ControllerBase
{
    private const string GenericSubscribeError = "No pudimos procesar tu suscripción. Probá de nuevo en unos minutos.";
    private const string GenericUnsubscribeError = "No pudimos procesar tu baja. Probá de nuevo en unos minutos.";
    private const string InvalidEmailError = "Ingresá un email válido.";

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe(SubscribeRequest request, CancellationToken ct)
    {
        // Campo trampa para bots: si viene completo, fingimos éxito sin hacer nada.
        if (!string.IsNullOrEmpty(request.Honeypot))
        {
            return Ok(new NewsletterResult(true));
        }

        var email = NormalizeEmail(request.Email);
        if (!EmailRegex().IsMatch(email))
        {
            return Ok(new NewsletterResult(false, InvalidEmailError));
        }

        try
        {
            var existing = await db.Contacts.FirstOrDefaultAsync(c => c.Email == email, ct);
            var alreadySubscribed = existing is { Unsubscribed: false };

            Contact contact;
            if (existing is null)
            {
                contact = new Contact
                {
                    Id = Guid.NewGuid(),
                    Email = email,
                    Unsubscribed = false,
                    SubscribedAt = DateTimeOffset.UtcNow,
                };
                db.Contacts.Add(contact);
            }
            else
            {
                contact = existing;
                if (contact.Unsubscribed)
                {
                    contact.Unsubscribed = false;
                    contact.SubscribedAt = DateTimeOffset.UtcNow;
                    contact.UnsubscribedAt = null;
                }
            }

            await db.SaveChangesAsync(ct);

            if (!alreadySubscribed)
            {
                var siteUrl = config["SiteUrl"] ?? "https://hakori.co";

                try
                {
                    var resendId = await resend.UpsertAudienceContactAsync(email, unsubscribed: false, ct);
                    if (resendId is not null)
                    {
                        contact.ResendContactId = resendId;
                        await db.SaveChangesAsync(ct);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "subscribe: no se pudo espejar el contacto en Resend para {Email}.", email);
                }

                try
                {
                    var unsubscribeUrl = $"{siteUrl}/cancelar-suscripcion?email={Uri.EscapeDataString(email)}";
                    await resend.SendWelcomeEmailAsync(email, siteUrl, unsubscribeUrl, ct);
                }
                catch (Exception ex)
                {
                    // El contacto ya quedó guardado; perder el mail de bienvenida
                    // es menos grave que perder el lead, así que no fallamos acá.
                    logger.LogError(ex, "subscribe: no se pudo enviar el email de bienvenida a {Email}.", email);
                }
            }

            return Ok(new NewsletterResult(true));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "subscribe: error inesperado al procesar {Email}.", email);
            return Ok(new NewsletterResult(false, GenericSubscribeError));
        }
    }

    [HttpPost("unsubscribe")]
    public async Task<IActionResult> Unsubscribe(UnsubscribeRequest request, CancellationToken ct)
    {
        var email = NormalizeEmail(request.Email);
        if (!EmailRegex().IsMatch(email))
        {
            return Ok(new NewsletterResult(false, InvalidEmailError));
        }

        try
        {
            var contact = await db.Contacts.FirstOrDefaultAsync(c => c.Email == email, ct);
            if (contact is not null && !contact.Unsubscribed)
            {
                contact.Unsubscribed = true;
                contact.UnsubscribedAt = DateTimeOffset.UtcNow;
                await db.SaveChangesAsync(ct);
            }

            // Un contacto inexistente ya está "de baja" desde el punto de vista
            // del usuario: no tiene sentido mostrarle un error (idempotente).
            try
            {
                await resend.UpsertAudienceContactAsync(email, unsubscribed: true, ct);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "unsubscribe: no se pudo espejar la baja en Resend para {Email}.", email);
            }

            return Ok(new NewsletterResult(true));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "unsubscribe: error inesperado al procesar {Email}.", email);
            return Ok(new NewsletterResult(false, GenericUnsubscribeError));
        }
    }

    private static string NormalizeEmail(string? email) => (email ?? "").Trim().ToLowerInvariant();

    [GeneratedRegex(@"^[^\s@]+@[^\s@]+\.[^\s@]+$")]
    private static partial Regex EmailRegex();
}
