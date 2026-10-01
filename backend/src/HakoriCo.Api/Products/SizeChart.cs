namespace HakoriCo.Api.Products;

/// <summary>
/// Reusable size template ("Remera oversize", "Buzo"…): which sizes a garment
/// comes in, their measurements and the stock curve. Applying it to a product
/// copies the values — products never reference a chart, so editing or
/// deleting a chart doesn't touch existing products.
/// </summary>
public class SizeChart
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }

    public List<SizeChartRow> Rows { get; set; } = [];
}

public class SizeChartRow
{
    public Guid Id { get; set; }
    public Guid SizeChartId { get; set; }
    public SizeChart SizeChart { get; set; } = null!;

    public string Size { get; set; } = "";
    public int SortOrder { get; set; }

    public decimal? ChestCm { get; set; }
    public decimal? LengthCm { get; set; }
    public decimal? SleeveCm { get; set; }

    /// <summary>Units of this size per "curva" (e.g. 1-2-3-3-2-1). 0 = none.</summary>
    public int CurveUnits { get; set; }
}
