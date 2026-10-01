using HakoriCo.Api.Admin.Dtos;
using HakoriCo.Api.Coupons;
using HakoriCo.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Admin;

[ApiController]
[Route("api/admin/coupons")]
[Authorize(Policy = "RequireAdminRole")]
public class AdminCouponsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCoupons()
    {
        var coupons = await db.Coupons.OrderByDescending(c => c.CreatedAt).ToListAsync();
        var now = DateTimeOffset.UtcNow;
        return Ok(coupons.Select(c => ToDto(c, now)));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCoupon(Guid id)
    {
        var coupon = await db.Coupons.FirstOrDefaultAsync(c => c.Id == id);
        return coupon is null ? NotFound() : Ok(ToDto(coupon, DateTimeOffset.UtcNow));
    }

    [HttpPost]
    public async Task<IActionResult> CreateCoupon(SaveCouponRequest request)
    {
        if (Validate(request, out var discountType) is { } error)
        {
            return BadRequest(new { error });
        }

        var code = CouponService.Normalize(request.Code);
        if (code.Length == 0)
        {
            do
            {
                code = CouponService.GenerateCode();
            }
            while (await db.Coupons.AnyAsync(c => c.Code == code));
        }
        else if (await db.Coupons.AnyAsync(c => c.Code == code))
        {
            return Conflict(new { error = $"Ya existe un cupón con el código \"{code}\"." });
        }

        var coupon = new Coupon
        {
            Id = Guid.NewGuid(),
            Code = code,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        Apply(coupon, request, discountType);

        db.Coupons.Add(coupon);
        await db.SaveChangesAsync();

        return Created($"/api/admin/coupons/{coupon.Id}", ToDto(coupon, DateTimeOffset.UtcNow));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCoupon(Guid id, SaveCouponRequest request)
    {
        var coupon = await db.Coupons.FirstOrDefaultAsync(c => c.Id == id);
        if (coupon is null)
        {
            return NotFound();
        }

        if (Validate(request, out var discountType) is { } error)
        {
            return BadRequest(new { error });
        }

        var code = CouponService.Normalize(request.Code);
        if (code.Length == 0)
        {
            return BadRequest(new { error = "El código es obligatorio." });
        }

        if (code != coupon.Code && await db.Coupons.AnyAsync(c => c.Code == code && c.Id != id))
        {
            return Conflict(new { error = $"Ya existe un cupón con el código \"{code}\"." });
        }

        coupon.Code = code;
        Apply(coupon, request, discountType);
        await db.SaveChangesAsync();

        return Ok(ToDto(coupon, DateTimeOffset.UtcNow));
    }

    [HttpPatch("{id:guid}/active")]
    public async Task<IActionResult> SetActive(Guid id, SetCouponActiveRequest request)
    {
        var coupon = await db.Coupons.FirstOrDefaultAsync(c => c.Id == id);
        if (coupon is null)
        {
            return NotFound();
        }

        coupon.IsActive = request.IsActive;
        await db.SaveChangesAsync();

        return Ok(ToDto(coupon, DateTimeOffset.UtcNow));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCoupon(Guid id)
    {
        var coupon = await db.Coupons.FirstOrDefaultAsync(c => c.Id == id);
        if (coupon is null)
        {
            return NotFound();
        }

        // Orders and carts reference the coupon with ON DELETE SET NULL; orders
        // keep their CouponCode snapshot, carts simply lose the coupon.
        db.Coupons.Remove(coupon);
        await db.SaveChangesAsync();

        return Ok(new { ok = true });
    }

    private static string? Validate(SaveCouponRequest request, out CouponDiscountType discountType)
    {
        if (!Enum.TryParse(request.DiscountType, ignoreCase: true, out discountType))
        {
            return "Elegí un tipo de descuento válido.";
        }

        if (discountType == CouponDiscountType.Percentage && (request.Value < 1 || request.Value > 100))
        {
            return "El porcentaje tiene que estar entre 1 y 100.";
        }

        if (discountType == CouponDiscountType.FixedAmount && request.Value <= 0)
        {
            return "El monto de descuento tiene que ser mayor a cero.";
        }

        if (request.MaxUses is < 1)
        {
            return "La cantidad máxima de usos tiene que ser al menos 1.";
        }

        return null;
    }

    private static void Apply(Coupon coupon, SaveCouponRequest request, CouponDiscountType discountType)
    {
        coupon.DiscountType = discountType;
        coupon.Value = request.Value;
        coupon.MaxUses = request.MaxUses;
        coupon.ExpiresAt = request.ExpiresAt;
        coupon.OnePerEmail = request.OnePerEmail;
        coupon.IsActive = request.IsActive;
    }

    private static AdminCouponDto ToDto(Coupon coupon, DateTimeOffset now) => new(
        coupon.Id,
        coupon.Code,
        coupon.DiscountType.ToString(),
        coupon.Value,
        coupon.MaxUses,
        coupon.UsedCount,
        coupon.ExpiresAt,
        coupon.OnePerEmail,
        coupon.IsActive,
        StatusOf(coupon, now),
        coupon.CreatedAt);

    private static string StatusOf(Coupon coupon, DateTimeOffset now) =>
        !coupon.IsActive ? "Inactive"
        : coupon.ExpiresAt <= now ? "Expired"
        : coupon.MaxUses is not null && coupon.UsedCount >= coupon.MaxUses ? "Exhausted"
        : "Active";
}
