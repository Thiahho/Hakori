using HakoriCo.Api.Data;
using HakoriCo.Api.Orders;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Coupons;

public record CouponEvaluation(bool Valid, decimal Discount, string? Error);

public class CouponService(AppDbContext db)
{
    private const string CodeChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public static string Normalize(string? code) => (code ?? "").Trim().ToUpperInvariant();

    public static string GenerateCode()
    {
        Span<char> code = stackalloc char[8];
        for (var i = 0; i < code.Length; i++)
        {
            code[i] = CodeChars[Random.Shared.Next(CodeChars.Length)];
        }

        return new string(code);
    }

    /// <summary>
    /// Validates the coupon against its own rules (active / expiry / remaining uses)
    /// and computes the discount for <paramref name="subtotal"/>. The per-email rule
    /// needs the buyer's email, so it's checked separately at checkout.
    /// </summary>
    public static CouponEvaluation Evaluate(Coupon coupon, decimal subtotal, DateTimeOffset now)
    {
        if (!coupon.IsActive)
        {
            return new(false, 0, "El cupón no está activo.");
        }

        if (coupon.ExpiresAt is not null && coupon.ExpiresAt <= now)
        {
            return new(false, 0, "El cupón está vencido.");
        }

        if (coupon.MaxUses is not null && coupon.UsedCount >= coupon.MaxUses)
        {
            return new(false, 0, "El cupón ya no tiene usos disponibles.");
        }

        var discount = coupon.DiscountType == CouponDiscountType.Percentage
            ? Math.Round(subtotal * coupon.Value / 100m, 2, MidpointRounding.AwayFromZero)
            : Math.Min(coupon.Value, subtotal);

        // Mercado Pago can't charge a zero total, so a coupon that would make the
        // order free isn't applicable to this cart.
        if (subtotal - discount <= 0)
        {
            return new(false, 0, "El cupón no se puede aplicar a este carrito.");
        }

        return new(true, discount, null);
    }

    public Task<bool> HasEmailUsedAsync(Guid couponId, string email, CancellationToken ct)
    {
        var normalizedEmail = email.Trim().ToLower();
        return db.Orders.AnyAsync(
            o => o.CouponId == couponId
                && o.Email.ToLower() == normalizedEmail
                // Cancelled/expired orders gave their use back, so they don't count.
                && o.Status != OrderStatus.Cancelled
                && o.Status != OrderStatus.Expired,
            ct);
    }

    /// <summary>
    /// Atomically takes one use of the coupon — same single UPDATE ... WHERE pattern
    /// as <see cref="StockService.TryReserveAsync"/>, so two concurrent checkouts
    /// can't both take the last remaining use.
    /// </summary>
    public async Task<bool> TryConsumeAsync(Guid couponId, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var affected = await db.Database.ExecuteSqlInterpolatedAsync(
            $"""
            UPDATE "Coupons"
            SET "UsedCount" = "UsedCount" + 1
            WHERE "Id" = {couponId}
              AND "IsActive"
              AND ("ExpiresAt" IS NULL OR "ExpiresAt" > {now})
              AND ("MaxUses" IS NULL OR "UsedCount" < "MaxUses")
            """, ct);

        return affected > 0;
    }
}
