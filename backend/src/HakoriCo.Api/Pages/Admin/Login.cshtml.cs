using HakoriCo.Api.Admin.Identity;
using HakoriCo.Api.Data.Seed;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace HakoriCo.Api.Pages.Admin;

public class LoginModel(SignInManager<AdminUser> signInManager) : PageModel
{
    [BindProperty]
    public string Email { get; set; } = "";

    [BindProperty]
    public string Password { get; set; } = "";

    public string? Error { get; set; }

    public void OnGet()
    {
    }

    public async Task<IActionResult> OnPostAsync()
    {
        var result = await signInManager.PasswordSignInAsync(Email, Password, isPersistent: true, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            Error = "Email o contraseña incorrectos.";
            return Page();
        }

        var user = await signInManager.UserManager.FindByEmailAsync(Email);
        if (user is null || !await signInManager.UserManager.IsInRoleAsync(user, AdminSeeder.AdminRole))
        {
            await signInManager.SignOutAsync();
            Error = "No tenés permisos de administrador.";
            return Page();
        }

        return RedirectToPage("/Admin/Products/Index");
    }
}
