using HakoriCo.Api.Cart.Dtos;
using HakoriCo.Api.Coupons;
using HakoriCo.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Cart;

[ApiController]
[Route("api/cart")]
public class CartController(AppDbContext db, CartAccessor carts) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCart(CancellationToken ct)
    {
        var cart = await carts.GetExistingCartAsync(HttpContext, db, ct);
        return Ok(cart is null ? EmptyCart() : ToDto(cart));
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemRequest request, CancellationToken ct)
    {
        if (request.Quantity <= 0)
        {
            return BadRequest(new { error = "La cantidad debe ser mayor a cero." });
        }

        var variant = await db.ProductVariants
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == request.ProductVariantId, ct);

        if (variant is null || !variant.Product.IsActive)
        {
            return NotFound(new { error = "El producto no existe." });
        }

        var cart = await carts.GetOrCreateCartAsync(HttpContext, db, ct);
        var item = cart.Items.FirstOrDefault(i => i.ProductVariantId == request.ProductVariantId);
        var requestedTotal = (item?.Quantity ?? 0) + request.Quantity;
        var availableStock = variant.Stock - variant.Reserved;

        if (requestedTotal > availableStock)
        {
            return BadRequest(new { error = "No hay stock suficiente para ese talle." });
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
        return Ok(ToDto(reloaded));
    }

    [HttpPatch("items/{itemId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid itemId, UpdateCartItemRequest request, CancellationToken ct)
    {
        if (request.Quantity <= 0)
        {
            return BadRequest(new { error = "La cantidad debe ser mayor a cero." });
        }

        var cart = await carts.GetExistingCartAsync(HttpContext, db, ct);
        var item = cart?.Items.FirstOrDefault(i => i.Id == itemId);
        if (cart is null || item is null)
        {
            return NotFound();
        }

        var availableStock = item.ProductVariant.Stock - item.ProductVariant.Reserved;
        if (request.Quantity > availableStock)
        {
            return BadRequest(new { error = "No hay stock suficiente para ese talle." });
        }

        item.Quantity = request.Quantity;
        await db.SaveChangesAsync(ct);

        var reloaded = await carts.ReloadAsync(cart.Id, db, ct);
        return Ok(ToDto(reloaded));
    }

    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid itemId, CancellationToken ct)
    {
        var cart = await carts.GetExistingCartAsync(HttpContext, db, ct);
        var item = cart?.Items.FirstOrDefault(i => i.Id == itemId);
        if (cart is null || item is null)
        {
            return NotFound();
        }

        db.CartItems.Remove(item);
        await db.SaveChangesAsync(ct);

        var reloaded = await carts.ReloadAsync(cart.Id, db, ct);
        return Ok(ToDto(reloaded));
    }

    [HttpPost("coupon")]
    public async Task<IActionResult> ApplyCoupon(ApplyCouponRequest request, CancellationToken ct)
    {
        var code = CouponService.Normalize(request.Code);
        if (code.Length == 0)
        {
            return BadRequest(new { error = "Ingresá un código de descuento." });
        }

        var coupon = await db.Coupons.FirstOrDefaultAsync(c => c.Code == code, ct);
        if (coupon is null)
        {
            return BadRequest(new { error = "El cupón no existe." });
        }

        var cart = await carts.GetExistingCartAsync(HttpContext, db, ct);
        if (cart is null || cart.Items.Count == 0)
        {
            return BadRequest(new { error = "Tu carrito está vacío." });
        }

        var evaluation = CouponService.Evaluate(coupon, Subtotal(cart), DateTimeOffset.UtcNow);
        if (!evaluation.Valid)
        {
            return BadRequest(new { error = evaluation.Error });
        }

        cart.CouponId = coupon.Id;
        await db.SaveChangesAsync(ct);

        var reloaded = await carts.ReloadAsync(cart.Id, db, ct);
        return Ok(ToDto(reloaded));
    }

    [HttpDelete("coupon")]
    public async Task<IActionResult> RemoveCoupon(CancellationToken ct)
    {
        var cart = await carts.GetExistingCartAsync(HttpContext, db, ct);
        if (cart is null)
        {
            return Ok(EmptyCart());
        }

        cart.CouponId = null;
        await db.SaveChangesAsync(ct);

        var reloaded = await carts.ReloadAsync(cart.Id, db, ct);
        return Ok(ToDto(reloaded));
    }

    private static CartDto EmptyCart() => new([], 0, 0, 0, 0, null, null);

    private static decimal Subtotal(Cart cart) =>
        cart.Items.Sum(i => i.ProductVariant.Product.Price * i.Quantity);

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

        var subtotal = items.Sum(i => i.UnitPrice * i.Quantity);
        decimal discount = 0;
        string? couponError = null;

        if (cart.Coupon is not null && items.Count > 0)
        {
            var evaluation = CouponService.Evaluate(cart.Coupon, subtotal, DateTimeOffset.UtcNow);
            discount = evaluation.Discount;
            couponError = evaluation.Error;
        }

        return new CartDto(
            items,
            items.Sum(i => i.Quantity),
            subtotal,
            discount,
            subtotal - discount,
            cart.Coupon?.Code,
            couponError);
    }
}
