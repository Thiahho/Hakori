using HakoriCo.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Orders.Payments;

/// <summary>
/// Applies a MercadoPago payment's state to its order. Shared by the webhook
/// and by the buyer's return from checkout, so the order is confirmed by
/// whichever arrives first.
/// </summary>
public class PaymentReconciler(
    AppDbContext db,
    IMercadoPagoClient mercadoPago,
    StockService stockService,
    ILogger<PaymentReconciler> logger)
{
    /// <param name="expectedOrderNumber">When set, the payment is ignored unless
    /// it belongs to this order — callers passing a buyer-supplied payment id
    /// must set it.</param>
    public async Task ReconcileAsync(long paymentId, string? expectedOrderNumber, CancellationToken ct)
    {
        // Never trust the caller's own status — always fetch the
        // authoritative payment state from MercadoPago's API.
        var payment = await mercadoPago.GetPaymentAsync(paymentId, ct);
        if (payment?.ExternalReference is null)
        {
            return;
        }

        if (expectedOrderNumber is not null && payment.ExternalReference != expectedOrderNumber)
        {
            logger.LogWarning(
                "payments: el pago {PaymentId} no corresponde a la orden {OrderNumber}.", paymentId, expectedOrderNumber);
            return;
        }

        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == payment.ExternalReference, ct);

        if (order is null)
        {
            logger.LogWarning("payments: no se encontró la orden {OrderNumber}.", payment.ExternalReference);
            return;
        }

        switch (payment.Status)
        {
            case "approved":
                order.MercadoPagoPaymentId = payment.Id.ToString();
                await stockService.ConfirmAndDecrementAsync(order.Id, ct);
                break;

            case "rejected" or "cancelled":
                if (order.Status == OrderStatus.PendingPayment)
                {
                    await stockService.ReleaseReservationAsync(order, ct);
                    order.Status = OrderStatus.Cancelled;
                    order.MercadoPagoPaymentId = payment.Id.ToString();
                    await db.SaveChangesAsync(ct);
                }
                break;

            default:
                // pending / in_process / etc. — nothing to do yet, MP will notify again.
                break;
        }
    }
}
