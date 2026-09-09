using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace HakoriCo.Api.Pages.Admin;

public class IndexModel : PageModel
{
    public IActionResult OnGet() => RedirectToPage("/Admin/Products/Index");
}
