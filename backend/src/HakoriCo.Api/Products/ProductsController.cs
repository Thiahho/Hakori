using HakoriCo.Api.Data;
using HakoriCo.Api.Products.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Products;

[ApiController]
[Route("api/products")]
public class ProductsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        var products = await db.Products
            .Where(p => p.IsActive)
            .OrderBy(p => p.SortOrder)
            .Include(p => p.Variants)
            .ToListAsync();

        return Ok(products.Select(ToListItemDto));
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetProduct(string slug)
    {
        var product = await db.Products
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive);

        return product is null ? NotFound() : Ok(ToDetailDto(product));
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
            .OrderBy(v => SizeOrder.Index(v.Size)).ThenBy(v => v.Size)
            .Select(v => new ProductVariantDto(v.Id, v.Size, v.Sku, v.Stock - v.Reserved, v.ChestCm, v.LengthCm, v.SleeveCm))
            .ToList();
}
