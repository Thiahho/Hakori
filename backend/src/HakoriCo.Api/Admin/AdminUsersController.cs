using HakoriCo.Api.Admin.Dtos;
using HakoriCo.Api.Admin.Identity;
using HakoriCo.Api.Data.Seed;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace HakoriCo.Api.Admin;

[ApiController]
[Route("api/admin/users")]
[Authorize(Policy = "RequireAdminRole")]
public class AdminUsersController(UserManager<AdminUser> userManager) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateAdminUser(CreateAdminUserRequest request)
    {
        var email = request.Email.Trim();
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { error = "Email y contraseña son obligatorios." });
        }

        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return Conflict(new { error = $"Ya existe un usuario con el email \"{email}\"." });
        }

        var user = new AdminUser
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            EmailConfirmed = true,
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var error = string.Join(" ", result.Errors.Select(e => e.Description));
            return BadRequest(new { error });
        }

        await userManager.AddToRoleAsync(user, AdminSeeder.AdminRole);

        return Created($"/api/admin/users/{user.Id}", new AdminUserDto(user.Id, user.Email));
    }
}
