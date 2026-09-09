namespace HakoriCo.Api.Products.Dtos;

public record ProductDetailDto(
    string Id,
    string Index,
    string Slug,
    string Name,
    decimal Price,
    string Description,
    string Image,
    string StoryImage,
    string StoryQuote,
    string StoryText,
    IReadOnlyList<ProductVariantDto> Variants);
