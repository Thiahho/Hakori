using HakoriCo.Api.Products;

namespace HakoriCo.Api.Cart;

public class CartItem
{
    public Guid Id { get; set; }
    public Guid CartId { get; set; }
    public Cart Cart { get; set; } = null!;
    public Guid ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;
    public int Quantity { get; set; }
}
