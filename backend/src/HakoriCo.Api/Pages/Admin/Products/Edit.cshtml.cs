using HakoriCo.Api.Data;
using HakoriCo.Api.Products;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Pages.Admin.Products;

public class EditModel(AppDbContext db) : PageModel
{
    [BindProperty(SupportsGet = true)]
    public Guid Id { get; set; }

    public Product? Product { get; set; }

    [BindProperty]
    public decimal Price { get; set; }

    [BindProperty]
    public bool IsActive { get; set; }

    [BindProperty]
    public List<VariantInput> Variants { get; set; } = [];

    public string? Message { get; set; }

    public class VariantInput
    {
        public Guid Id { get; set; }
        public string Size { get; set; } = "";
        public string Sku { get; set; } = "";
        public int Stock { get; set; }
    }

    public async Task<IActionResult> OnGetAsync()
    {
        Product = await LoadProductAsync();
        if (Product is null)
        {
            return RedirectToPage("Index");
        }

        Price = Product.Price;
        IsActive = Product.IsActive;
        Variants = ToVariantInputs(Product);
        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        Product = await LoadProductAsync();
        if (Product is null)
        {
            return RedirectToPage("Index");
        }

        Product.Price = Price;
        Product.IsActive = IsActive;

        foreach (var input in Variants)
        {
            var variant = Product.Variants.FirstOrDefault(v => v.Id == input.Id);
            if (variant is not null)
            {
                variant.Stock = Math.Max(0, input.Stock);
            }
        }

        await db.SaveChangesAsync();

        Message = "Guardado.";
        Variants = ToVariantInputs(Product);
        return Page();
    }

    private Task<Product?> LoadProductAsync() =>
        db.Products.Include(p => p.Variants).FirstOrDefaultAsync(p => p.Id == Id);

    private static List<VariantInput> ToVariantInputs(Product product) =>
        product.Variants
            .OrderBy(v => v.Size)
            .Select(v => new VariantInput { Id = v.Id, Size = v.Size, Sku = v.Sku, Stock = v.Stock })
            .ToList();
}
