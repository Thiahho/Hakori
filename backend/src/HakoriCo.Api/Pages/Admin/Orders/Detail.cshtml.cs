using HakoriCo.Api.Data;
using HakoriCo.Api.Orders;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Pages.Admin.Orders;

public class DetailModel(AppDbContext db, StockService stockService) : PageModel
{
    [BindProperty(SupportsGet = true)]
    public string OrderNumber { get; set; } = "";

    public Order? Order { get; set; }

    public async Task<IActionResult> OnGetAsync()
    {
        Order = await LoadOrderAsync();
        return Order is null ? RedirectToPage("Index") : Page();
    }

    public async Task<IActionResult> OnPostMarkPaidAsync()
    {
        Order = await LoadOrderAsync();
        if (Order is null)
        {
            return RedirectToPage("Index");
        }

        if (Order.Status != OrderStatus.Paid)
        {
            await stockService.ConfirmAndDecrementAsync(Order.Id, HttpContext.RequestAborted);
        }

        return RedirectToPage(new { orderNumber = OrderNumber });
    }

    public async Task<IActionResult> OnPostCancelAsync()
    {
        Order = await LoadOrderAsync();
        if (Order is null)
        {
            return RedirectToPage("Index");
        }

        if (Order.Status == OrderStatus.PendingPayment)
        {
            await stockService.ReleaseReservationAsync(Order, HttpContext.RequestAborted);
        }

        if (Order.Status != OrderStatus.Paid)
        {
            Order.Status = OrderStatus.Cancelled;
            await db.SaveChangesAsync();
        }

        return RedirectToPage(new { orderNumber = OrderNumber });
    }

    private Task<Order?> LoadOrderAsync() =>
        db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.OrderNumber == OrderNumber);
}
