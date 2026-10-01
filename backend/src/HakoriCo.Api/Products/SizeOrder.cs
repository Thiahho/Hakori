namespace HakoriCo.Api.Products;

/// <summary>Garment size ordering (XS → XXL) — alphabetical order would put L before M.</summary>
public static class SizeOrder
{
    // Keep in sync with STANDARD_SIZES in web/src/lib/admin/product-constants.ts.
    public static readonly string[] Standard = ["XS", "S", "M", "L", "XL", "XXL"];

    public static int Index(string size)
    {
        var index = Array.IndexOf(Standard, size.ToUpperInvariant());
        return index < 0 ? int.MaxValue : index;
    }
}
