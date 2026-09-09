using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using HakoriCo.Api.Newsletter.Templates;
using Microsoft.Extensions.Options;

namespace HakoriCo.Api.Newsletter;

/// <summary>
/// Thin wrapper over Resend's REST API (https://api.resend.com) — Resend has no
/// official .NET SDK, only JS/Python/PHP/Ruby/Go, so we call the HTTP API directly.
/// </summary>
public class ResendClient(HttpClient http, IOptions<ResendOptions> options, ILogger<ResendClient> logger) : IResendClient
{
    private readonly ResendOptions _options = options.Value;

    public async Task<string?> UpsertAudienceContactAsync(string email, bool unsubscribed, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(_options.ApiKey) || string.IsNullOrEmpty(_options.AudienceId))
        {
            logger.LogWarning("Resend no configurado (falta ApiKey o AudienceId); se omite la sincronización de la Audience para {Email}.", email);
            return null;
        }

        EnsureAuthHeader();

        var updateResponse = await http.PatchAsJsonAsync(
            $"audiences/{_options.AudienceId}/contacts/{Uri.EscapeDataString(email)}",
            new { unsubscribed },
            ct);

        if (updateResponse.IsSuccessStatusCode)
        {
            return await ReadContactIdAsync(updateResponse, ct);
        }

        var createResponse = await http.PostAsJsonAsync(
            $"audiences/{_options.AudienceId}/contacts",
            new { email, unsubscribed },
            ct);

        createResponse.EnsureSuccessStatusCode();
        return await ReadContactIdAsync(createResponse, ct);
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string siteUrl, string unsubscribeUrl, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(_options.ApiKey) || string.IsNullOrEmpty(_options.EmailFrom))
        {
            logger.LogWarning("Resend no configurado (falta ApiKey o EmailFrom); se omite el email de bienvenida para {Email}.", toEmail);
            return;
        }

        EnsureAuthHeader();

        var response = await http.PostAsJsonAsync("emails", new
        {
            from = _options.EmailFrom,
            to = toEmail,
            subject = "Estás en la lista de espera · Hakori Drop 001",
            html = WelcomeEmailHtml.Build(siteUrl, unsubscribeUrl),
        }, ct);

        response.EnsureSuccessStatusCode();
    }

    private void EnsureAuthHeader()
    {
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);
    }

    private static async Task<string?> ReadContactIdAsync(HttpResponseMessage response, CancellationToken ct)
    {
        try
        {
            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            return doc.RootElement.TryGetProperty("id", out var idProp) ? idProp.GetString() : null;
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
