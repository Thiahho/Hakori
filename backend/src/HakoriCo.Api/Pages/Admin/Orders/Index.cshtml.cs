using HakoriCo.Api.Data;
using HakoriCo.Api.Orders;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Pages.Admin.Orders;

public class IndexModel(AppDbContext db) : PageModel
{
    [BindProperty(SupportsGet = true)]
    public string? Status { get; set; }

    public List<Order> Orders { get; set; } = [];

    public IEnumerable<OrderStatus> Statuses => Enum.GetValues<OrderStatus>();

    public async Task OnGetAsync()
    {
        var query = db.Orders.AsQueryable();

        if (!string.IsNullOrEmpty(Status) && Enum.TryParse<OrderStatus>(Status, out var status))
        {
            query = query.Where(o => o.Status == status);
        }

        Orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
    }
}
