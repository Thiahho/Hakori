using HakoriCo.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Orders;

/// <summary>
/// Reserves/decrements ProductVariant stock. Reservation uses a single
/// atomic UPDATE ... WHERE per variant (row-level locked by Postgres) instead
/// of read-then-write, so two concurrent checkouts racing for the last unit
/// of a size can't both succeed.
/// </summary>
public class StockService(AppDbContext db)
{
    public async Task<bool> TryReserveAsync(IReadOnlyList<(Guid VariantId, int Quantity)> items, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);

        foreach (var (variantId, quantity) in items)
        {
            var affected = await db.Database.ExecuteSqlInterpolatedAsync(
                $"""
                UPDATE "ProductVariants"
                SET "Reserved" = "Reserved" + {quantity}
                WHERE "Id" = {variantId} AND "Stock" - "Reserved" >= {quantity}
                """, ct);

            if (affected == 0)
            {
                await tx.RollbackAsync(ct);
                return false;
            }
        }

        await tx.CommitAsync(ct);
        return true;
    }

    /// <summary>
    /// Undoes a checkout's reservations: variant stock and, if the order used one,
    /// the coupon use taken at checkout. Every cancellation path (MP failure,
    /// rejected webhook, admin cancel, expiration sweep) goes through here.
    /// </summary>
    public async Task ReleaseReservationAsync(Order order, CancellationToken ct)
    {
        if (order.CouponId is { } couponId)
        {
            await db.Database.ExecuteSqlInterpolatedAsync(
                $"""
                UPDATE "Coupons"
                SET "UsedCount" = GREATEST(0, "UsedCount" - 1)
                WHERE "Id" = {couponId}
                """, ct);
        }

        foreach (var item in order.Items)
        {
            await db.Database.ExecuteSqlInterpolatedAsync(
                $"""
                UPDATE "ProductVariants"
                SET "Reserved" = GREATEST(0, "Reserved" - {item.Quantity})
                WHERE "Id" = {item.ProductVariantId}
                """, ct);
        }
    }

    /// <summary>Idempotent: a second call on an already-Paid order is a no-op, so duplicate payment webhooks can't double-decrement.</summary>
    public async Task<bool> ConfirmAndDecrementAsync(Guid orderId, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);

        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId, ct);
        if (order is null || order.Status == OrderStatus.Paid)
        {
            await tx.RollbackAsync(ct);
            return false;
        }

        foreach (var item in order.Items)
        {
            await db.Database.ExecuteSqlInterpolatedAsync(
                $"""
                UPDATE "ProductVariants"
                SET "Reserved" = GREATEST(0, "Reserved" - {item.Quantity}),
                    "Stock" = GREATEST(0, "Stock" - {item.Quantity})
                WHERE "Id" = {item.ProductVariantId}
                """, ct);
        }

        order.Status = OrderStatus.Paid;
        order.PaidAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return true;
    }
}
