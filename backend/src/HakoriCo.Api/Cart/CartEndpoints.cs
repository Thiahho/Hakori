using HakoriCo.Api.Cart.Dtos;
using HakoriCo.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Cart;

public static class CartEndpoints
{
    public static void MapCartEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/cart");

        group.MapGet("", async (HttpContext ctx, AppDbContext db, CartAccessor carts, CancellationToken ct) =>
        {
            var cart = await carts.GetExistingCartAsync(ctx, db, ct);
            return Results.Ok(cart is null ? EmptyCart() : ToDto(cart));
        });

        group.MapPost("/items", async (AddCartItemRequest request, HttpContext ctx, AppDbContext db, CartAccessor carts, CancellationToken ct) =>
        {
            if (request.Quantity <= 0)
            {
                return Results.BadRequest(new { error = "La cantidad debe ser mayor a cero." });
            }

            var variant = await db.ProductVariants
                .Include(v => v.Product)
                .FirstOrDefaultAsync(v => v.Id == request.ProductVariantId, ct);

            if (variant is null || !variant.Product.IsActive)
            {
                return Results.NotFound(new { error = "El producto no existe." });
            }

            var cart = await carts.GetOrCreateCartAsync(ctx, db, ct);
            var item = cart.Items.FirstOrDefault(i => i.ProductVariantId == request.ProductVariantId);
            var requestedTotal = (item?.Quantity ?? 0) + request.Quantity;
            var availableStock = variant.Stock - variant.Reserved;

            if (requestedTotal > availableStock)
            {
                return Results.BadRequest(new { error = "No hay stock suficiente para ese talle." });
            }

            if (item is null)
            {
                db.CartItems.Add(new CartItem
                {
                    Id = Guid.NewGuid(),
                    CartId = cart.Id,
                    ProductVariantId = variant.Id,
                    Quantity = request.Quantity,
                });
            }
            else
            {
                item.Quantity = requestedTotal;
            }

            await db.SaveChangesAsync(ct);

            var reloaded = await carts.ReloadAsync(cart.Id, db, ct);
            return Results.Ok(ToDto(reloaded));
        });

        group.MapPatch("/items/{itemId:guid}", async (Guid itemId, UpdateCartItemRequest request, HttpContext ctx, AppDbContext db, CartAccessor carts, CancellationToken ct) =>
        {
            if (request.Quantity <= 0)
            {
                return Results.BadRequest(new { error = "La cantidad debe ser mayor a cero." });
            }

            var cart = await carts.GetExistingCartAsync(ctx, db, ct);
            var item = cart?.Items.FirstOrDefault(i => i.Id == itemId);
            if (cart is null || item is null)
            {
                return Results.NotFound();
            }

            var availableStock = item.ProductVariant.Stock - item.ProductVariant.Reserved;
            if (request.Quantity > availableStock)
            {
                return Results.BadRequest(new { error = "No hay stock suficiente para ese talle." });
            }

            item.Quantity = request.Quantity;
            await db.SaveChangesAsync(ct);

            var reloaded = await carts.ReloadAsync(cart.Id, db, ct);
            return Results.Ok(ToDto(reloaded));
        });

        group.MapDelete("/items/{itemId:guid}", async (Guid itemId, HttpContext ctx, AppDbContext db, CartAccessor carts, CancellationToken ct) =>
        {
            var cart = await carts.GetExistingCartAsync(ctx, db, ct);
            var item = cart?.Items.FirstOrDefault(i => i.Id == itemId);
            if (cart is null || item is null)
            {
                return Results.NotFound();
            }

            db.CartItems.Remove(item);
            await db.SaveChangesAsync(ct);

            var reloaded = await carts.ReloadAsync(cart.Id, db, ct);
            return Results.Ok(ToDto(reloaded));
        });
    }

    private static CartDto EmptyCart() => new([], 0, 0);

    private static CartDto ToDto(Cart cart)
    {
        var items = cart.Items.Select(i => new CartItemDto(
            i.Id,
            i.ProductVariantId,
            i.ProductVariant.Product.Name,
            i.ProductVariant.Product.Slug,
            i.ProductVariant.Size,
            i.ProductVariant.Product.Image,
            i.ProductVariant.Product.Price,
            i.Quantity,
            i.ProductVariant.Stock - i.ProductVariant.Reserved)).ToList();

        return new CartDto(items, items.Sum(i => i.Quantity), items.Sum(i => i.UnitPrice * i.Quantity));
    }
}
