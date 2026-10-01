using HakoriCo.Api.Admin.Dtos;
using HakoriCo.Api.Admin.Identity;
using HakoriCo.Api.Data.Seed;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace HakoriCo.Api.Admin;

/// <summary>
/// JSON API consumed only by the Next.js admin (server-to-server) — never
/// called directly from a browser, so no CORS policy is needed here.
/// </summary>
[ApiController]
[Route("api/admin")]
public class AdminAuthController(SignInManager<AdminUser> signInManager) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login(AdminLoginRequest request)
    {
        var result = await signInManager.PasswordSignInAsync(request.Email, request.Password, isPersistent: true, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            return StatusCode(StatusCodes.Status401Unauthorized, new { ok = false, error = "Email o contraseña incorrectos." });
        }

        var user = await signInManager.UserManager.FindByEmailAsync(request.Email);
        if (user is null || !await signInManager.UserManager.IsInRoleAsync(user, AdminSeeder.AdminRole))
        {
            await signInManager.SignOutAsync();
            return StatusCode(StatusCodes.Status403Forbidden, new { ok = false, error = "No tenés permisos de administrador." });
        }

        return Ok(new { ok = true });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return Ok(new { ok = true });
    }
}
