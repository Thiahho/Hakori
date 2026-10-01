using HakoriCo.Api.Coupons;

namespace HakoriCo.Api.Cart;

public class Cart
{
    public Guid Id { get; set; }
    public string Token { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }

    public Guid? CouponId { get; set; }
    public Coupon? Coupon { get; set; }

    public List<CartItem> Items { get; set; } = [];
}
