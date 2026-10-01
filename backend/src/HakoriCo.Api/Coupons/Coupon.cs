namespace HakoriCo.Api.Coupons;

public class Coupon
{
    public Guid Id { get; set; }

    /// <summary>Always stored upper-cased (see <see cref="CouponService.Normalize"/>).</summary>
    public string Code { get; set; } = "";

    public CouponDiscountType DiscountType { get; set; }

    /// <summary>Percentage (1–100) or fixed ARS amount, depending on <see cref="DiscountType"/>.</summary>
    public decimal Value { get; set; }

    /// <summary>null = unlimited uses.</summary>
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; }

    public DateTimeOffset? ExpiresAt { get; set; }
    public bool OnePerEmail { get; set; }
    public bool IsActive { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}

public enum CouponDiscountType
{
    Percentage,
    FixedAmount,
}
