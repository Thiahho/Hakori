namespace HakoriCo.Api.Products;

public class Product
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = "";
    public string Index { get; set; } = "";
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public string Description { get; set; } = "";
    public string Image { get; set; } = "";
    public string StoryImage { get; set; } = "";
    public string StoryQuote { get; set; } = "";
    public string StoryText { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public List<ProductVariant> Variants { get; set; } = [];
}
