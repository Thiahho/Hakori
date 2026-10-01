using Microsoft.EntityFrameworkCore;
using HakoriCo.Api.Data;

namespace HakoriCo.Api.Cart;

/// <summary>
/// Resolves the guest cart from an httpOnly cookie, creating one on first use.
/// No login is required to shop — matches the guest-checkout decision for Drop 001.
/// </summary>
public class CartAccessor
{
    public const string CookieName = "hakori_cart";
    private static readonly TimeSpan CartLifetime = TimeSpan.FromDays(7);

    public async Task<Cart> GetOrCreateCartAsync(HttpContext context, AppDbContext db, CancellationToken ct)
    {
        var cart = await GetExistingCartAsync(context, db, ct);
        if (cart is not null)
        {
            return cart;
        }

        cart = new Cart
        {
            Id = Guid.NewGuid(),
            Token = Guid.NewGuid().ToString("N"),
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.Add(CartLifetime),
        };
        db.Carts.Add(cart);
        await db.SaveChangesAsync(ct);

        SetCookie(context, cart.Token);
        return cart;
    }

    public async Task<Cart?> GetExistingCartAsync(HttpContext context, AppDbContext db, CancellationToken ct)
    {
        var token = context.Request.Cookies[CookieName];
        if (string.IsNullOrEmpty(token))
        {
            return null;
        }

        var cart = await db.Carts
            .Include(c => c.Coupon)
            .Include(c => c.Items).ThenInclude(i => i.ProductVariant).ThenInclude(v => v.Product)
            .FirstOrDefaultAsync(c => c.Token == token && c.ExpiresAt > DateTimeOffset.UtcNow, ct);

        if (cart is not null)
        {
            SetCookie(context, cart.Token);
        }

        return cart;
    }

    /// <summary>Reloads a cart with its items by id — use after a mutation instead of
    /// re-resolving via cookie, since a cookie set on the response isn't visible on
    /// Request.Cookies within the same request.</summary>
    public async Task<Cart> ReloadAsync(Guid cartId, AppDbContext db, CancellationToken ct)
    {
        return await db.Carts
            .Include(c => c.Coupon)
            .Include(c => c.Items).ThenInclude(i => i.ProductVariant).ThenInclude(v => v.Product)
            .FirstAsync(c => c.Id == cartId, ct);
    }

    private static void SetCookie(HttpContext context, string token)
    {
        context.Response.Cookies.Append(CookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = context.Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.Add(CartLifetime),
            Path = "/",
        });
    }
}
