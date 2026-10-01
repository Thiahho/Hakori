namespace HakoriCo.Api.Orders;

public class Order
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = "";
    public OrderStatus Status { get; set; }

    public string Email { get; set; } = "";
    public string ShippingName { get; set; } = "";
    public string ShippingAddress { get; set; } = "";
    public string ShippingCity { get; set; } = "";
    public string ShippingPostalCode { get; set; } = "";
    public string ShippingPhone { get; set; } = "";

    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }

    /// <summary>Subtotal - DiscountAmount: what the buyer is charged.</summary>
    public decimal Total { get; set; }

    public Guid? CouponId { get; set; }

    /// <summary>Snapshot of the code, kept even if the coupon is later deleted.</summary>
    public string? CouponCode { get; set; }

    public string? MercadoPagoPreferenceId { get; set; }
    public string? MercadoPagoPaymentId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }

    public List<OrderItem> Items { get; set; } = [];
}
