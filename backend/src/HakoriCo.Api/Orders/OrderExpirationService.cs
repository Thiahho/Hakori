using HakoriCo.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Orders;

/// <summary>Expires PendingPayment orders past their TTL and releases their stock reservation.</summary>
public class OrderExpirationService(IServiceScopeFactory scopeFactory, ILogger<OrderExpirationService> logger) : BackgroundService
{
    private static readonly TimeSpan SweepInterval = TimeSpan.FromMinutes(2);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SweepAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "OrderExpirationService: error al barrer órdenes vencidas.");
            }

            try
            {
                await Task.Delay(SweepInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private async Task SweepAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var stockService = scope.ServiceProvider.GetRequiredService<StockService>();

        var now = DateTimeOffset.UtcNow;
        var expired = await db.Orders
            .Include(o => o.Items)
            .Where(o => o.Status == OrderStatus.PendingPayment && o.ExpiresAt != null && o.ExpiresAt < now)
            .ToListAsync(ct);

        foreach (var order in expired)
        {
            await stockService.ReleaseReservationAsync(order, ct);
            order.Status = OrderStatus.Expired;
        }

        if (expired.Count > 0)
        {
            await db.SaveChangesAsync(ct);
            logger.LogInformation("OrderExpirationService: se expiraron {Count} órdenes.", expired.Count);
        }
    }
}
