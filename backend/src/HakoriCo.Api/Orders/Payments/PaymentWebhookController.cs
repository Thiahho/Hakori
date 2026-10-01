using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HakoriCo.Api.Orders.Payments;

[ApiController]
[Route("api/payments/webhook")]
public class PaymentWebhookController(
    PaymentReconciler reconciler,
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

        await reconciler.ReconcileAsync(paymentId, expectedOrderNumber: null, ct);

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
