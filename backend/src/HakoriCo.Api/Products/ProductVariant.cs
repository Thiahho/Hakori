namespace HakoriCo.Api.Products;

public class ProductVariant
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Size { get; set; } = "";
    public string Sku { get; set; } = "";
    public int Stock { get; set; }
    public int Reserved { get; set; }
}
