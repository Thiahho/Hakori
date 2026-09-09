namespace HakoriCo.Api.Orders.Payments;

public class MercadoPagoOptions
{
    public string AccessToken { get; set; } = "";
    public string WebhookSecret { get; set; } = "";
}
