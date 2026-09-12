using HakoriCo.Api.Data;
using HakoriCo.Api.Products.Dtos;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Products;

public static class ProductsEndpoints
{
    public static void MapProductsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/products");

        group.MapGet("", async (AppDbContext db) =>
        {
            var products = await db.Products
                .Where(p => p.IsActive)
                .OrderBy(p => p.SortOrder)
                .Include(p => p.Variants)
                .ToListAsync();

            return Results.Ok(products.Select(ToListItemDto));
        });

        group.MapGet("/{slug}", async (string slug, AppDbContext db) =>
        {
            var product = await db.Products
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive);

            return product is null ? Results.NotFound() : Results.Ok(ToDetailDto(product));
        });
    }

    private static ProductListItemDto ToListItemDto(Product product) => new(
        product.Id.ToString(),
        product.Index,
        product.Slug,
        product.Name,
        product.Price,
        product.Description,
        product.Image,
        product.StoryImage,
        product.StoryQuote,
        product.StoryText,
        ToVariantDtos(product.Variants));

    private static ProductDetailDto ToDetailDto(Product product) => new(
        product.Id.ToString(),
        product.Index,
        product.Slug,
        product.Name,
        product.Price,
        product.Description,
        product.Image,
        product.StoryImage,
        product.StoryQuote,
        product.StoryText,
        ToVariantDtos(product.Variants));

    private static List<ProductVariantDto> ToVariantDtos(IEnumerable<ProductVariant> variants) =>
        variants
            .Select(v => new ProductVariantDto(v.Id, v.Size, v.Sku, v.Stock - v.Reserved, v.ChestCm, v.LengthCm, v.SleeveCm))
            .ToList();
}
