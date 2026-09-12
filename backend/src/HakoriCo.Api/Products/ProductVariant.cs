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

    // Null until an admin loads real measurements for this size — kept
    // distinct from 0 so the storefront can tell "not measured yet" apart
    // from an actual zero-width measurement.
    public decimal? ChestCm { get; set; }
    public decimal? LengthCm { get; set; }
    public decimal? SleeveCm { get; set; }
}
