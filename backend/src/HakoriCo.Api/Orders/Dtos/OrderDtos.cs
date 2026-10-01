namespace HakoriCo.Api.Orders.Dtos;

public record CheckoutRequest(
    string Email,
    string ShippingName,
    string ShippingAddress,
    string ShippingCity,
    string ShippingPostalCode,
    string ShippingPhone);

public record CheckoutResponse(string OrderNumber, string InitPoint);

public record OrderItemDto(string ProductName, string Size, decimal UnitPrice, int Quantity);

public record OrderDto(
    string OrderNumber,
    string Status,
    string Email,
    decimal Subtotal,
    decimal DiscountAmount,
    string? CouponCode,
    decimal Total,
    DateTimeOffset CreatedAt,
    DateTimeOffset? PaidAt,
    IReadOnlyList<OrderItemDto> Items);
