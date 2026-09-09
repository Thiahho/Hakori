namespace HakoriCo.Api.Cart;

public class Cart
{
    public Guid Id { get; set; }
    public string Token { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }

    public List<CartItem> Items { get; set; } = [];
}
