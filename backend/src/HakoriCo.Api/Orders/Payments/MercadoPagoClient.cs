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
        string notificationUrl,
        CancellationToken ct = default)
    {
        var request = new PreferenceRequest
        {
            Items = order.Items.Select(item => new PreferenceItemRequest
            {
                Title = $"{item.ProductName} - Talle {item.Size}",
                Quantity = item.Quantity,
                CurrencyId = "ARS",
                UnitPrice = item.UnitPrice,
            }).ToList(),
            BackUrls = new PreferenceBackUrlsRequest
            {
                Success = successUrl,
                Failure = failureUrl,
                Pending = pendingUrl,
            },
            NotificationUrl = notificationUrl,
            ExternalReference = order.OrderNumber,
        };

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
