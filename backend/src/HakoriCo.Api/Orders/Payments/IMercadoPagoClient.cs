namespace HakoriCo.Api.Orders.Payments;

public record MercadoPagoPaymentStatus(long Id, string Status, string? ExternalReference);

public interface IMercadoPagoClient
{
    Task<(string PreferenceId, string InitPoint)> CreatePreferenceAsync(
        Order order,
        string successUrl,
        string failureUrl,
        string pendingUrl,
        string? notificationUrl,
        CancellationToken ct = default);

    Task<MercadoPagoPaymentStatus?> GetPaymentAsync(long paymentId, CancellationToken ct = default);
}
