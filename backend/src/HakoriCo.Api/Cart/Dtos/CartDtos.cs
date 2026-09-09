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

public record CartDto(IReadOnlyList<CartItemDto> Items, int ItemCount, decimal Total);

public record AddCartItemRequest(Guid ProductVariantId, int Quantity);

public record UpdateCartItemRequest(int Quantity);
