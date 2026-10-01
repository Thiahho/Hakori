using HakoriCo.Api.Admin.Dtos;
using HakoriCo.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Admin;

[ApiController]
[Route("api/admin/subscribers")]
[Authorize(Policy = "RequireAdminRole")]
public class AdminSubscribersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetSubscribers()
    {
        var contacts = await db.Contacts.OrderByDescending(c => c.SubscribedAt).ToListAsync();

        return Ok(contacts.Select(c =>
            new AdminSubscriberDto(c.Id, c.Email, c.Unsubscribed, c.SubscribedAt, c.UnsubscribedAt)));
    }
}
