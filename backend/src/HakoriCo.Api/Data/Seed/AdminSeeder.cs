using HakoriCo.Api.Admin.Identity;
using Microsoft.AspNetCore.Identity;

namespace HakoriCo.Api.Data.Seed;

/// <summary>
/// Bootstraps the first admin account. No self-registration exists — this is the
/// only way to create an admin, and it only acts when AdminSeed:Email/Password
/// are configured (empty by default, so it's a no-op unless explicitly set).
/// </summary>
public static class AdminSeeder
{
    public const string AdminRole = "Admin";

    public static async Task SeedAsync(IServiceProvider services, IConfiguration config)
    {
        var email = config["AdminSeed:Email"];
        var password = config["AdminSeed:Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        if (!await roleManager.RoleExistsAsync(AdminRole))
        {
            await roleManager.CreateAsync(new IdentityRole<Guid>(AdminRole));
        }

        var userManager = services.GetRequiredService<UserManager<AdminUser>>();
        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return;
        }

        var user = new AdminUser
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            EmailConfirmed = true,
        };

        var result = await userManager.CreateAsync(user, password);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(user, AdminRole);
        }
    }
}
