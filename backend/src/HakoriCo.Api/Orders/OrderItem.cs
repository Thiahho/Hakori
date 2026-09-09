namespace HakoriCo.Api.Orders;

public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductVariantId { get; set; }

    // Snapshot at order time — decoupled from later catalog edits.
    public string ProductName { get; set; } = "";
    public string Size { get; set; } = "";
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}
