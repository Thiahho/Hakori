using MercadoPago.Client.Payment;
using MercadoPago.Client.Preference;
using MercadoPago.Config;
using Microsoft.Extensions.Options;

namespace HakoriCo.Api.Orders.Payments;

/// <summary>
/// Wraps the official mercadopago-sdk NuGet package. Checkout Pro (hosted
/// redirect): we create a "preference" and send the buyer to MercadoPago's
/// page, avoiding PCI scope entirely — appropriate for a first drop launch.
/// </summary>
public class MercadoPagoClient : IMercadoPagoClient
{
    public MercadoPagoClient(IOptions<MercadoPagoOptions> options)
    {
        MercadoPagoConfig.AccessToken = options.Value.AccessToken;
    }

    public async Task<(string PreferenceId, string InitPoint)> CreatePreferenceAsync(
        Order order,
        string successUrl,
        string failureUrl,
        string pendingUrl,
        string? notificationUrl,
        CancellationToken ct = default)
    {
        // MP rejects negative line items, and spreading a discount across unit
        // prices causes rounding drift — so a discounted order goes as a single
        // line for the exact total. The itemized detail stays on the Order.
        List<PreferenceItemRequest> items = order.DiscountAmount > 0
            ?
            [
                new PreferenceItemRequest
                {
                    Title = $"Pedido {order.OrderNumber} (cupón {order.CouponCode})",
                    Quantity = 1,
                    CurrencyId = "ARS",
                    UnitPrice = order.Total,
                },
            ]
            : order.Items.Select(item => new PreferenceItemRequest
            {
                Title = $"{item.ProductName} - Talle {item.Size}",
                Quantity = item.Quantity,
                CurrencyId = "ARS",
                UnitPrice = item.UnitPrice,
            }).ToList();

        var request = new PreferenceRequest
        {
            Items = items,
            BackUrls = new PreferenceBackUrlsRequest
            {
                Success = successUrl,
                Failure = failureUrl,
                Pending = pendingUrl,
            },
            NotificationUrl = notificationUrl,
            ExternalReference = order.OrderNumber,
        };

        // Sends the buyer back to the site on approval without them clicking
        // "Volver al sitio". MP rejects the whole preference if auto_return is
        // set with a non-public success URL, so it's skipped on localhost.
        if (Uri.TryCreate(successUrl, UriKind.Absolute, out var successUri)
            && successUri.Scheme == Uri.UriSchemeHttps
            && !successUri.IsLoopback)
        {
            request.AutoReturn = "approved";
        }

        var client = new PreferenceClient();
        var preference = await client.CreateAsync(request);

        return (preference.Id, preference.InitPoint);
    }

    public async Task<MercadoPagoPaymentStatus?> GetPaymentAsync(long paymentId, CancellationToken ct = default)
    {
        var client = new PaymentClient();
        var payment = await client.GetAsync(paymentId);

        return payment is null
            ? null
            : new MercadoPagoPaymentStatus(payment.Id ?? paymentId, payment.Status ?? "", payment.ExternalReference);
    }
}
