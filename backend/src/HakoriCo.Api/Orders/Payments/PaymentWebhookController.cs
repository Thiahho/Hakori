using System.Security.Cryptography;
using System.Text;
using HakoriCo.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HakoriCo.Api.Orders.Payments;

[ApiController]
[Route("api/payments/webhook")]
public class PaymentWebhookController(
    AppDbContext db,
    IMercadoPagoClient mercadoPago,
    StockService stockService,
    IOptions<MercadoPagoOptions> options,
    ILogger<Order> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> HandleWebhook(CancellationToken ct)
    {
        var dataId = Request.Query["data.id"].ToString();
        var requestId = Request.Headers["x-request-id"].ToString();
        var signatureHeader = Request.Headers["x-signature"].ToString();

        if (string.IsNullOrEmpty(dataId))
        {
            return BadRequest();
        }

        var webhookSecret = options.Value.WebhookSecret;
        if (!string.IsNullOrEmpty(webhookSecret))
        {
            if (!IsSignatureValid(signatureHeader, dataId, requestId, webhookSecret))
            {
                logger.LogWarning("payments/webhook: firma inválida para data.id={DataId}.", dataId);
                return Unauthorized();
            }
        }
        else
        {
            logger.LogWarning("payments/webhook: MercadoPago:WebhookSecret no configurado; se omite la validación de firma.");
        }

        if (!long.TryParse(dataId, out var paymentId))
        {
            return BadRequest();
        }

        // Never trust the notification payload's own status — always fetch the
        // authoritative payment state from MercadoPago's API.
        var payment = await mercadoPago.GetPaymentAsync(paymentId, ct);
        if (payment?.ExternalReference is null)
        {
            return Ok();
        }

        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == payment.ExternalReference, ct);

        if (order is null)
        {
            logger.LogWarning("payments/webhook: no se encontró la orden {OrderNumber}.", payment.ExternalReference);
            return Ok();
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

        return Ok();
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
