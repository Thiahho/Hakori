using System.Security.Cryptography;
using System.Text;
using HakoriCo.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HakoriCo.Api.Orders.Payments;

public static class PaymentWebhookEndpoint
{
    public static void MapPaymentWebhookEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/payments/webhook", HandleWebhook);
    }

    private static async Task<IResult> HandleWebhook(
        HttpContext ctx,
        AppDbContext db,
        IMercadoPagoClient mercadoPago,
        StockService stockService,
        IOptions<MercadoPagoOptions> options,
        ILogger<Order> logger,
        CancellationToken ct)
    {
        var dataId = ctx.Request.Query["data.id"].ToString();
        var requestId = ctx.Request.Headers["x-request-id"].ToString();
        var signatureHeader = ctx.Request.Headers["x-signature"].ToString();

        if (string.IsNullOrEmpty(dataId))
        {
            return Results.BadRequest();
        }

        var webhookSecret = options.Value.WebhookSecret;
        if (!string.IsNullOrEmpty(webhookSecret))
        {
            if (!IsSignatureValid(signatureHeader, dataId, requestId, webhookSecret))
            {
                logger.LogWarning("payments/webhook: firma inválida para data.id={DataId}.", dataId);
                return Results.Unauthorized();
            }
        }
        else
        {
            logger.LogWarning("payments/webhook: MercadoPago:WebhookSecret no configurado; se omite la validación de firma.");
        }

        if (!long.TryParse(dataId, out var paymentId))
        {
            return Results.BadRequest();
        }

        // Never trust the notification payload's own status — always fetch the
        // authoritative payment state from MercadoPago's API.
        var payment = await mercadoPago.GetPaymentAsync(paymentId, ct);
        if (payment?.ExternalReference is null)
        {
            return Results.Ok();
        }

        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == payment.ExternalReference, ct);

        if (order is null)
        {
            logger.LogWarning("payments/webhook: no se encontró la orden {OrderNumber}.", payment.ExternalReference);
            return Results.Ok();
        }

        switch (payment.Status)
        {
            case "approved":
                order.MercadoPagoPaymentId = payment.Id.ToString();
                await stockService.ConfirmAndDecrementAsync(order.Id, ct);
                break;

            case "rejected" or "cancelled":
                if (order.Status == OrderStatus.PendingPayment)
                {
                    await stockService.ReleaseReservationAsync(order, ct);
                    order.Status = OrderStatus.Cancelled;
                    order.MercadoPagoPaymentId = payment.Id.ToString();
                    await db.SaveChangesAsync(ct);
                }
                break;

            default:
                // pending / in_process / etc. — nothing to do yet, MP will notify again.
                break;
        }

        return Results.Ok();
    }

    private static bool IsSignatureValid(string signatureHeader, string dataId, string requestId, string secret)
    {
        var parts = signatureHeader
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(p => p.Split('=', 2))
            .Where(p => p.Length == 2)
            .ToDictionary(p => p[0], p => p[1]);

        if (!parts.TryGetValue("ts", out var ts) || !parts.TryGetValue("v1", out var v1))
        {
            return false;
        }

        var manifest = $"id:{dataId.ToLowerInvariant()};request-id:{requestId};ts:{ts};";
        var computed = Convert.ToHexStringLower(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(manifest)));

        return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(computed), Encoding.UTF8.GetBytes(v1));
    }
}
