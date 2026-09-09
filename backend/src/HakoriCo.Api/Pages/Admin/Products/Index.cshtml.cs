using HakoriCo.Api.Data;
using HakoriCo.Api.Products;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Pages.Admin.Products;

public class IndexModel(AppDbContext db) : PageModel
{
    public List<Product> Products { get; set; } = [];

    public async Task OnGetAsync()
    {
        Products = await db.Products
            .Include(p => p.Variants)
            .OrderBy(p => p.SortOrder)
            .ToListAsync();
    }

    public int TotalStock(Product product) => product.Variants.Sum(v => v.Stock);
}
