namespace HakoriCo.Api.Cart.Dtos;

public record CartItemDto(
    Guid ItemId,
    Guid ProductVariantId,
    string ProductName,
    string Slug,
    string Size,
    string Image,
    decimal UnitPrice,
    int Quantity,
    int AvailableStock);

/// <param name="Total">Subtotal minus Discount — what the buyer will be charged.</param>
/// <param name="CouponError">Set when the cart's coupon no longer applies (deactivated, expired, exhausted…); Discount is then 0.</param>
public record CartDto(
    IReadOnlyList<CartItemDto> Items,
    int ItemCount,
    decimal Subtotal,
    decimal Discount,
    decimal Total,
    string? CouponCode,
    string? CouponError);

public record AddCartItemRequest(Guid ProductVariantId, int Quantity);

public record UpdateCartItemRequest(int Quantity);

public record ApplyCouponRequest(string? Code);
