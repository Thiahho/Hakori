using HakoriCo.Api.Cart;
using HakoriCo.Api.Coupons;
using HakoriCo.Api.Data;
using HakoriCo.Api.Orders.Dtos;
using HakoriCo.Api.Orders.Payments;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Orders;

[ApiController]
[Route("api")]
public class OrdersController(
    AppDbContext db,
    CartAccessor carts,
    StockService stockService,
    CouponService couponService,
    IMercadoPagoClient mercadoPago,
    IConfiguration config,
    ILogger<Order> logger) : ControllerBase
{
    private const string OrderNumberChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static readonly TimeSpan PendingPaymentTtl = TimeSpan.FromMinutes(30);

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout(CheckoutRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email)
            || string.IsNullOrWhiteSpace(request.ShippingName)
            || string.IsNullOrWhiteSpace(request.ShippingAddress)
            || string.IsNullOrWhiteSpace(request.ShippingCity)
            || string.IsNullOrWhiteSpace(request.ShippingPostalCode)
            || string.IsNullOrWhiteSpace(request.ShippingPhone))
        {
            return BadRequest(new { error = "Completá todos los datos de envío." });
        }

        var cart = await carts.GetExistingCartAsync(HttpContext, db, ct);
        if (cart is null || cart.Items.Count == 0)
        {
            return BadRequest(new { error = "Tu carrito está vacío." });
        }

        var subtotal = cart.Items.Sum(i => i.ProductVariant.Product.Price * i.Quantity);
        decimal discount = 0;
        var coupon = cart.Coupon;

        if (coupon is not null)
        {
            var evaluation = CouponService.Evaluate(coupon, subtotal, DateTimeOffset.UtcNow);
            if (!evaluation.Valid)
            {
                return BadRequest(new { error = evaluation.Error });
            }

            if (coupon.OnePerEmail && await couponService.HasEmailUsedAsync(coupon.Id, request.Email, ct))
            {
                return BadRequest(new { error = "Ya usaste este cupón." });
            }

            discount = evaluation.Discount;
        }

        var reserveItems = cart.Items.Select(i => (i.ProductVariantId, i.Quantity)).ToList();
        var reserved = await stockService.TryReserveAsync(reserveItems, ct);
        if (!reserved)
        {
            return Conflict(new { error = "Uno de los productos ya no tiene stock suficiente." });
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = GenerateOrderNumber(),
            Status = OrderStatus.PendingPayment,
            Email = request.Email.Trim(),
            ShippingName = request.ShippingName.Trim(),
            ShippingAddress = request.ShippingAddress.Trim(),
            ShippingCity = request.ShippingCity.Trim(),
            ShippingPostalCode = request.ShippingPostalCode.Trim(),
            ShippingPhone = request.ShippingPhone.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.Add(PendingPaymentTtl),
            Items = cart.Items.Select(i => new OrderItem
            {
                Id = Guid.NewGuid(),
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductVariant.Product.Name,
                Size = i.ProductVariant.Size,
                UnitPrice = i.ProductVariant.Product.Price,
                Quantity = i.Quantity,
            }).ToList(),
        };
        order.Subtotal = subtotal;
        order.Total = subtotal;

        if (coupon is not null)
        {
            if (!await couponService.TryConsumeAsync(coupon.Id, ct))
            {
                // CouponId is still null here, so this only releases the stock.
                await stockService.ReleaseReservationAsync(order, ct);
                return Conflict(new { error = "El cupón ya no está disponible." });
            }

            order.CouponId = coupon.Id;
            order.CouponCode = coupon.Code;
            order.DiscountAmount = discount;
            order.Total = subtotal - discount;
        }

        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);

        var siteUrl = (config["SiteUrl"] ?? "https://hakori.co").TrimEnd('/');
        var apiPublicUrl = (config["ApiPublicUrl"] ?? $"{Request.Scheme}://{Request.Host}").TrimEnd('/');

        try
        {
            var preference = await mercadoPago.CreatePreferenceAsync(
                order,
                successUrl: $"{siteUrl}/checkout/exito?order={order.OrderNumber}",
                failureUrl: $"{siteUrl}/checkout/error?order={order.OrderNumber}",
                pendingUrl: $"{siteUrl}/checkout/pendiente?order={order.OrderNumber}",
                notificationUrl: $"{apiPublicUrl}/api/payments/webhook",
                ct);

            order.MercadoPagoPreferenceId = preference.PreferenceId;
            db.CartItems.RemoveRange(cart.Items);
            cart.CouponId = null;
            await db.SaveChangesAsync(ct);

            return Ok(new CheckoutResponse(order.OrderNumber, preference.InitPoint));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "checkout: no se pudo crear la preferencia de Mercado Pago para {OrderNumber}.", order.OrderNumber);

            await stockService.ReleaseReservationAsync(order, ct);
            order.Status = OrderStatus.Cancelled;
            await db.SaveChangesAsync(ct);

            return Problem("No pudimos iniciar el pago. Probá de nuevo en unos minutos.", statusCode: StatusCodes.Status502BadGateway);
        }
    }

    [HttpGet("orders/{orderNumber}")]
    public async Task<IActionResult> GetOrder(string orderNumber, CancellationToken ct)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, ct);

        if (order is null)
        {
            return NotFound();
        }

        return Ok(new OrderDto(
            order.OrderNumber,
            order.Status.ToString(),
            order.Email,
            order.Subtotal,
            order.DiscountAmount,
            order.CouponCode,
            order.Total,
            order.CreatedAt,
            order.PaidAt,
            order.Items.Select(i => new OrderItemDto(i.ProductName, i.Size, i.UnitPrice, i.Quantity)).ToList()));
    }

    private static string GenerateOrderNumber()
    {
        Span<char> suffix = stackalloc char[6];
        for (var i = 0; i < suffix.Length; i++)
        {
            suffix[i] = OrderNumberChars[Random.Shared.Next(OrderNumberChars.Length)];
        }

        return $"HK-{DateTimeOffset.UtcNow:yyyyMMdd}-{new string(suffix)}";
    }
}
