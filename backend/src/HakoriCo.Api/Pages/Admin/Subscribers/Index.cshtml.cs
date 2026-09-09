using HakoriCo.Api.Data;
using HakoriCo.Api.Newsletter;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Pages.Admin.Subscribers;

public class IndexModel(AppDbContext db) : PageModel
{
    public List<Contact> Contacts { get; set; } = [];

    public async Task OnGetAsync()
    {
        Contacts = await db.Contacts.OrderByDescending(c => c.SubscribedAt).ToListAsync();
    }
}
