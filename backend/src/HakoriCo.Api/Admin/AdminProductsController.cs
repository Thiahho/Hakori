using HakoriCo.Api.Admin.Dtos;
using HakoriCo.Api.Data;
using HakoriCo.Api.Products;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Admin;

[ApiController]
[Route("api/admin/products")]
[Authorize(Policy = "RequireAdminRole")]
public class AdminProductsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        var products = await db.Products
            .Include(p => p.Variants)
            .OrderBy(p => p.SortOrder)
            .ToListAsync();

        return Ok(products.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var product = await db.Products.Include(p => p.Variants).FirstOrDefaultAsync(p => p.Id == id);
        return product is null ? NotFound() : Ok(ToDto(product));
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct(CreateProductRequest request)
    {
        var slug = request.Slug.Trim().ToLowerInvariant();
        var skuPrefix = request.SkuPrefix.Trim().ToUpperInvariant();
        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(slug) || string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(skuPrefix))
        {
            return BadRequest(new { error = "Slug, nombre y prefijo de SKU son obligatorios." });
        }

        if (request.Variants.Count == 0)
        {
            return BadRequest(new { error = "Elegí al menos un talle." });
        }

        if (await db.Products.AnyAsync(p => p.Slug == slug))
        {
            return Conflict(new { error = $"Ya existe un producto con el slug \"{slug}\"." });
        }

        var skus = request.Variants.Select(v => $"{skuPrefix}-{v.Size}").ToList();
        if (await db.ProductVariants.AnyAsync(v => skus.Contains(v.Sku)))
        {
            return Conflict(new { error = "Ya existe un talle con ese SKU — probá otro prefijo." });
        }

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Index = request.Index.Trim(),
            Slug = slug,
            Name = name,
            Price = request.Price,
            Description = request.Description.Trim(),
            Image = request.Image.Trim(),
            StoryImage = request.StoryImage.Trim(),
            StoryQuote = request.StoryQuote.Trim(),
            StoryText = request.StoryText.Trim(),
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
        };

        product.Variants = request.Variants
            .Select(v => new ProductVariant
            {
                Id = Guid.NewGuid(),
                Product = product,
                Size = v.Size,
                Sku = $"{skuPrefix}-{v.Size}",
                Stock = Math.Max(0, v.Stock),
                Reserved = 0,
                ChestCm = v.ChestCm,
                LengthCm = v.LengthCm,
                SleeveCm = v.SleeveCm,
            })
            .ToList();

        db.Products.Add(product);
        await db.SaveChangesAsync();

        return Created($"/api/admin/products/{product.Id}", ToDto(product));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProduct(Guid id, UpdateProductRequest request)
    {
        var product = await db.Products.Include(p => p.Variants).FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
        {
            return NotFound();
        }

        var slug = request.Slug.Trim().ToLowerInvariant();
        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(slug) || string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new { error = "Slug y nombre son obligatorios." });
        }

        if (slug != product.Slug && await db.Products.AnyAsync(p => p.Slug == slug && p.Id != id))
        {
            return Conflict(new { error = $"Ya existe un producto con el slug \"{slug}\"." });
        }

        // request.Variants is the full set of sizes the product should end up with:
        // matched by Id (or by size, so un-ticking and re-ticking a size in the same
        // edit keeps its variant/SKU), unknown sizes are added, missing ones removed.
        var inputs = request.Variants
            .Select(v => v with { Size = v.Size.Trim().ToUpperInvariant() })
            .ToList();

        if (inputs.Count == 0)
        {
            return BadRequest(new { error = "Elegí al menos un talle." });
        }

        if (inputs.Select(v => v.Size).Distinct().Count() != inputs.Count)
        {
            return BadRequest(new { error = "Hay talles repetidos." });
        }

        var matches = new List<(UpdateProductVariantInput Input, ProductVariant? Variant)>();
        foreach (var input in inputs)
        {
            var variant = input.Id is { } variantId
                ? product.Variants.FirstOrDefault(v => v.Id == variantId)
                : product.Variants.FirstOrDefault(v => v.Size == input.Size);

            if (input.Id is not null && variant is null)
            {
                return BadRequest(new { error = $"El talle {input.Size} no pertenece a este producto." });
            }

            matches.Add((input, variant));
        }

        var keptIds = matches.Where(m => m.Variant is not null).Select(m => m.Variant!.Id).ToHashSet();
        var removed = product.Variants.Where(v => !keptIds.Contains(v.Id)).ToList();
        foreach (var variant in removed)
        {
            // CartItem -> ProductVariant is a Restrict FK and Reserved > 0 means a
            // pending order still holds units; OrderItem keeps its own snapshot.
            if (variant.Reserved > 0 || await db.CartItems.AnyAsync(ci => ci.ProductVariantId == variant.Id))
            {
                return Conflict(new { error = $"No se puede quitar el talle {variant.Size}: tiene reservas o carritos activos." });
            }
        }

        var added = matches.Where(m => m.Variant is null).Select(m => m.Input).ToList();
        var skuPrefix = "";
        if (added.Count > 0)
        {
            skuPrefix = DeriveSkuPrefix(product) ?? (request.SkuPrefix ?? "").Trim().ToUpperInvariant();
            if (skuPrefix.Length == 0)
            {
                return BadRequest(new { error = "Falta el prefijo de SKU para los talles nuevos." });
            }

            var newSkus = added.Select(v => $"{skuPrefix}-{v.Size}").ToList();
            if (await db.ProductVariants.AnyAsync(v => newSkus.Contains(v.Sku)))
            {
                return Conflict(new { error = "Ya existe un talle con ese SKU — probá otro prefijo." });
            }
        }

        product.Index = request.Index.Trim();
        product.Slug = slug;
        product.Name = name;
        product.Price = request.Price;
        product.Description = request.Description.Trim();
        product.Image = request.Image.Trim();
        product.StoryImage = request.StoryImage.Trim();
        product.StoryQuote = request.StoryQuote.Trim();
        product.StoryText = request.StoryText.Trim();
        product.SortOrder = request.SortOrder;
        product.IsActive = request.IsActive;

        foreach (var (input, variant) in matches)
        {
            if (variant is not null)
            {
                variant.Stock = Math.Max(0, input.Stock);
                variant.ChestCm = input.ChestCm;
                variant.LengthCm = input.LengthCm;
                variant.SleeveCm = input.SleeveCm;
            }
        }

        foreach (var input in added)
        {
            var variant = new ProductVariant
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Size = input.Size,
                Sku = $"{skuPrefix}-{input.Size}",
                Stock = Math.Max(0, input.Stock),
                Reserved = 0,
                ChestCm = input.ChestCm,
                LengthCm = input.LengthCm,
                SleeveCm = input.SleeveCm,
            };
            db.ProductVariants.Add(variant);
            product.Variants.Add(variant);
        }

        foreach (var variant in removed)
        {
            db.ProductVariants.Remove(variant);
            product.Variants.Remove(variant);
        }

        await db.SaveChangesAsync();

        return Ok(ToDto(product));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var product = await db.Products.Include(p => p.Variants).FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
        {
            return NotFound();
        }

        // CartItem -> ProductVariant is a Restrict FK: deleting straight through
        // Postgres would throw on an active cart, so check first and give a
        // clean message instead of surfacing a raw DB error to the admin.
        var variantIds = product.Variants.Select(v => v.Id).ToList();
        var hasActiveCarts = await db.CartItems.AnyAsync(ci => variantIds.Contains(ci.ProductVariantId));
        if (hasActiveCarts)
        {
            return Conflict(new { error = $"No se puede eliminar \"{product.Name}\": hay carritos activos con ese producto." });
        }

        db.Products.Remove(product);
        await db.SaveChangesAsync();

        return Ok(new { ok = true });
    }

    /// <summary>"KATANA-XS" → "KATANA"; null when the product has no variants to derive from.</summary>
    private static string? DeriveSkuPrefix(Product product)
    {
        var variant = product.Variants.FirstOrDefault(v => v.Sku.EndsWith($"-{v.Size}"));
        return variant?.Sku[..^(variant.Size.Length + 1)];
    }

    private static AdminProductDto ToDto(Product product) => new(
        product.Id,
        product.Index,
        product.Slug,
        product.Name,
        product.Price,
        product.Description,
        product.Image,
        product.StoryImage,
        product.StoryQuote,
        product.StoryText,
        product.IsActive,
        product.SortOrder,
        product.Variants
            .OrderBy(v => SizeOrder.Index(v.Size)).ThenBy(v => v.Size)
            .Select(v => new AdminVariantDto(v.Id, v.Size, v.Sku, v.Stock, v.Reserved, v.ChestCm, v.LengthCm, v.SleeveCm))
            .ToList());
}
