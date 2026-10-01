using HakoriCo.Api.Admin.Dtos;
using HakoriCo.Api.Data;
using HakoriCo.Api.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Admin;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Policy = "RequireAdminRole")]
public class AdminOrdersController(AppDbContext db, StockService stockService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] string? status)
    {
        var query = db.Orders.AsQueryable();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<OrderStatus>(status, out var parsed))
        {
            query = query.Where(o => o.Status == parsed);
        }

        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();

        return Ok(orders.Select(o =>
            new AdminOrderListItemDto(o.OrderNumber, o.Status.ToString(), o.Email, o.Total, o.CreatedAt)));
    }

    [HttpGet("{orderNumber}")]
    public async Task<IActionResult> GetOrder(string orderNumber)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
        return order is null ? NotFound() : Ok(ToDetailDto(order));
    }

    [HttpPost("{orderNumber}/mark-paid")]
    public async Task<IActionResult> MarkOrderPaid(string orderNumber, CancellationToken ct)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, ct);
        if (order is null)
        {
            return NotFound();
        }

        if (order.Status != OrderStatus.Paid)
        {
            await stockService.ConfirmAndDecrementAsync(order.Id, ct);
        }

        return Ok(ToDetailDto(order));
    }

    [HttpPost("{orderNumber}/cancel")]
    public async Task<IActionResult> CancelOrder(string orderNumber, CancellationToken ct)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, ct);
        if (order is null)
        {
            return NotFound();
        }

        if (order.Status == OrderStatus.PendingPayment)
        {
            await stockService.ReleaseReservationAsync(order, ct);
        }

        if (order.Status != OrderStatus.Paid)
        {
            order.Status = OrderStatus.Cancelled;
            await db.SaveChangesAsync(ct);
        }

        return Ok(ToDetailDto(order));
    }

    private static AdminOrderDetailDto ToDetailDto(Order order) => new(
        order.OrderNumber,
        order.Status.ToString(),
        order.Email,
        order.ShippingName,
        order.ShippingAddress,
        order.ShippingCity,
        order.ShippingPostalCode,
        order.ShippingPhone,
        order.Subtotal,
        order.DiscountAmount,
        order.CouponCode,
        order.Total,
        order.MercadoPagoPreferenceId,
        order.MercadoPagoPaymentId,
        order.CreatedAt,
        order.PaidAt,
        order.ExpiresAt,
        order.Items.Select(i => new AdminOrderItemDto(i.ProductName, i.Size, i.UnitPrice, i.Quantity)).ToList());
}
