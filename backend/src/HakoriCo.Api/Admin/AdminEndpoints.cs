using HakoriCo.Api.Admin.Identity;
using Microsoft.AspNetCore.Identity;

namespace HakoriCo.Api.Admin;

public static class AdminEndpoints
{
    public static void MapAdminAuthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/admin/logout", async (SignInManager<AdminUser> signInManager) =>
        {
            await signInManager.SignOutAsync();
            return Results.Redirect("/admin/login");
        });
    }
}
