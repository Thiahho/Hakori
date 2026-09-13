using HakoriCo.Api.Admin.Dtos;
using HakoriCo.Api.Admin.Identity;
using HakoriCo.Api.Data;
using HakoriCo.Api.Data.Seed;
using HakoriCo.Api.Newsletter;
using HakoriCo.Api.Orders;
using HakoriCo.Api.Products;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Admin;

/// <summary>
/// JSON API consumed only by the Next.js admin (server-to-server) — never
/// called directly from a browser, so no CORS policy is needed here.
/// </summary>
public static class AdminApiEndpoints
{
    public static void MapAdminApiEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/admin/login", Login);
        app.MapPost("/api/admin/logout", Logout);

        var group = app.MapGroup("/api/admin").RequireAuthorization("RequireAdminRole");

        group.MapPost("/users", CreateAdminUser);

        group.MapGet("/products", GetProducts);
        group.MapGet("/products/{id:guid}", GetProduct);
        group.MapPost("/products", CreateProduct);
        group.MapPut("/products/{id:guid}", UpdateProduct);
        group.MapDelete("/products/{id:guid}", DeleteProduct);

        group.MapGet("/orders", GetOrders);
        group.MapGet("/orders/{orderNumber}", GetOrder);
        group.MapPost("/orders/{orderNumber}/mark-paid", MarkOrderPaid);
        group.MapPost("/orders/{orderNumber}/cancel", CancelOrder);

        group.MapGet("/subscribers", GetSubscribers);
    }

    private static async Task<IResult> Login(AdminLoginRequest request, SignInManager<AdminUser> signInManager)
    {
        var result = await signInManager.PasswordSignInAsync(request.Email, request.Password, isPersistent: true, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            return Results.Json(new { ok = false, error = "Email o contraseña incorrectos." }, statusCode: StatusCodes.Status401Unauthorized);
        }

        var user = await signInManager.UserManager.FindByEmailAsync(request.Email);
        if (user is null || !await signInManager.UserManager.IsInRoleAsync(user, AdminSeeder.AdminRole))
        {
            await signInManager.SignOutAsync();
            return Results.Json(new { ok = false, error = "No tenés permisos de administrador." }, statusCode: StatusCodes.Status403Forbidden);
        }

        return Results.Ok(new { ok = true });
    }

    private static async Task<IResult> Logout(SignInManager<AdminUser> signInManager)
    {
        await signInManager.SignOutAsync();
        return Results.Ok(new { ok = true });
    }

    private static async Task<IResult> CreateAdminUser(CreateAdminUserRequest request, UserManager<AdminUser> userManager)
    {
        var email = request.Email.Trim();
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest(new { error = "Email y contraseña son obligatorios." });
        }

        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return Results.Conflict(new { error = $"Ya existe un usuario con el email \"{email}\"." });
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
            return Results.BadRequest(new { error });
        }

        await userManager.AddToRoleAsync(user, AdminSeeder.AdminRole);

        return Results.Created($"/api/admin/users/{user.Id}", new AdminUserDto(user.Id, user.Email));
    }

    private static async Task<IResult> GetProducts(AppDbContext db)
    {
        var products = await db.Products
            .Include(p => p.Variants)
            .OrderBy(p => p.SortOrder)
            .ToListAsync();

        return Results.Ok(products.Select(ToDto));
    }

    private static async Task<IResult> GetProduct(Guid id, AppDbContext db)
    {
        var product = await db.Products.Include(p => p.Variants).FirstOrDefaultAsync(p => p.Id == id);
        return product is null ? Results.NotFound() : Results.Ok(ToDto(product));
    }

    private static async Task<IResult> CreateProduct(CreateProductRequest request, AppDbContext db)
    {
        var slug = request.Slug.Trim().ToLowerInvariant();
        var skuPrefix = request.SkuPrefix.Trim().ToUpperInvariant();
        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(slug) || string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(skuPrefix))
        {
            return Results.BadRequest(new { error = "Slug, nombre y prefijo de SKU son obligatorios." });
        }

        if (request.Variants.Count == 0)
        {
            return Results.BadRequest(new { error = "Elegí al menos un talle." });
        }

        if (await db.Products.AnyAsync(p => p.Slug == slug))
        {
            return Results.Conflict(new { error = $"Ya existe un producto con el slug \"{slug}\"." });
        }

        var skus = request.Variants.Select(v => $"{skuPrefix}-{v.Size}").ToList();
        if (await db.ProductVariants.AnyAsync(v => skus.Contains(v.Sku)))
        {
            return Results.Conflict(new { error = "Ya existe un talle con ese SKU — probá otro prefijo." });
        }

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Index = request.Index.Trim(),
            Slug = slug,
            Name = name,
            Price = request.Price,
            Description = request.Description.Trim(),
            Image = request.Image.Trim(),
            StoryImage = request.StoryImage.Trim(),
            StoryQuote = request.StoryQuote.Trim(),
            StoryText = request.StoryText.Trim(),
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
        };

        product.Variants = request.Variants
            .Select(v => new ProductVariant
            {
                Id = Guid.NewGuid(),
                Product = product,
                Size = v.Size,
                Sku = $"{skuPrefix}-{v.Size}",
                Stock = Math.Max(0, v.Stock),
                Reserved = 0,
                ChestCm = v.ChestCm,
                LengthCm = v.LengthCm,
                SleeveCm = v.SleeveCm,
            })
            .ToList();

        db.Products.Add(product);
        await db.SaveChangesAsync();

        return Results.Created($"/api/admin/products/{product.Id}", ToDto(product));
    }

    private static async Task<IResult> UpdateProduct(Guid id, UpdateProductRequest request, AppDbContext db)
    {
        var product = await db.Products.Include(p => p.Variants).FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
        {
            return Results.NotFound();
        }

        var slug = request.Slug.Trim().ToLowerInvariant();
        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(slug) || string.IsNullOrWhiteSpace(name))
        {
            return Results.BadRequest(new { error = "Slug y nombre son obligatorios." });
        }

        if (slug != product.Slug && await db.Products.AnyAsync(p => p.Slug == slug && p.Id != id))
        {
            return Results.Conflict(new { error = $"Ya existe un producto con el slug \"{slug}\"." });
        }

        product.Index = request.Index.Trim();
        product.Slug = slug;
        product.Name = name;
        product.Price = request.Price;
        product.Description = request.Description.Trim();
        product.Image = request.Image.Trim();
        product.StoryImage = request.StoryImage.Trim();
        product.StoryQuote = request.StoryQuote.Trim();
        product.StoryText = request.StoryText.Trim();
        product.SortOrder = request.SortOrder;
        product.IsActive = request.IsActive;

        foreach (var input in request.Variants)
        {
            var variant = product.Variants.FirstOrDefault(v => v.Id == input.Id);
            if (variant is not null)
            {
                variant.Stock = Math.Max(0, input.Stock);
                variant.ChestCm = input.ChestCm;
                variant.LengthCm = input.LengthCm;
                variant.SleeveCm = input.SleeveCm;
            }
        }

        await db.SaveChangesAsync();

        return Results.Ok(ToDto(product));
    }

    private static async Task<IResult> DeleteProduct(Guid id, AppDbContext db)
    {
        var product = await db.Products.Include(p => p.Variants).FirstOrDefaultAsync(p => p.Id == id);
        if (product is null)
        {
            return Results.NotFound();
        }

        // CartItem -> ProductVariant is a Restrict FK: deleting straight through
        // Postgres would throw on an active cart, so check first and give a
        // clean message instead of surfacing a raw DB error to the admin.
        var variantIds = product.Variants.Select(v => v.Id).ToList();
        var hasActiveCarts = await db.CartItems.AnyAsync(ci => variantIds.Contains(ci.ProductVariantId));
        if (hasActiveCarts)
        {
            return Results.Json(
                new { error = $"No se puede eliminar \"{product.Name}\": hay carritos activos con ese producto." },
                statusCode: StatusCodes.Status409Conflict);
        }

        db.Products.Remove(product);
        await db.SaveChangesAsync();

        return Results.Ok(new { ok = true });
    }

    private static AdminProductDto ToDto(Product product) => new(
        product.Id,
        product.Index,
        product.Slug,
        product.Name,
        product.Price,
        product.Description,
        product.Image,
        product.StoryImage,
        product.StoryQuote,
        product.StoryText,
        product.IsActive,
        product.SortOrder,
        product.Variants
            .OrderBy(v => v.Size)
            .Select(v => new AdminVariantDto(v.Id, v.Size, v.Sku, v.Stock, v.Reserved, v.ChestCm, v.LengthCm, v.SleeveCm))
            .ToList());

    private static async Task<IResult> GetOrders(string? status, AppDbContext db)
    {
        var query = db.Orders.AsQueryable();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<OrderStatus>(status, out var parsed))
        {
            query = query.Where(o => o.Status == parsed);
        }

        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();

        return Results.Ok(orders.Select(o =>
            new AdminOrderListItemDto(o.OrderNumber, o.Status.ToString(), o.Email, o.Total, o.CreatedAt)));
    }

    private static async Task<IResult> GetOrder(string orderNumber, AppDbContext db)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
        return order is null ? Results.NotFound() : Results.Ok(ToDetailDto(order));
    }

    private static async Task<IResult> MarkOrderPaid(string orderNumber, AppDbContext db, StockService stockService, CancellationToken ct)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, ct);
        if (order is null)
        {
            return Results.NotFound();
        }

        if (order.Status != OrderStatus.Paid)
        {
            await stockService.ConfirmAndDecrementAsync(order.Id, ct);
        }

        return Results.Ok(ToDetailDto(order));
    }

    private static async Task<IResult> CancelOrder(string orderNumber, AppDbContext db, StockService stockService, CancellationToken ct)
    {
        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, ct);
        if (order is null)
        {
            return Results.NotFound();
        }

        if (order.Status == OrderStatus.PendingPayment)
        {
            await stockService.ReleaseReservationAsync(order, ct);
        }

        if (order.Status != OrderStatus.Paid)
        {
            order.Status = OrderStatus.Cancelled;
            await db.SaveChangesAsync(ct);
        }

        return Results.Ok(ToDetailDto(order));
    }

    private static AdminOrderDetailDto ToDetailDto(Order order) => new(
        order.OrderNumber,
        order.Status.ToString(),
        order.Email,
        order.ShippingName,
        order.ShippingAddress,
        order.ShippingCity,
        order.ShippingPostalCode,
        order.ShippingPhone,
        order.Total,
        order.MercadoPagoPreferenceId,
        order.MercadoPagoPaymentId,
        order.CreatedAt,
        order.PaidAt,
        order.ExpiresAt,
        order.Items.Select(i => new AdminOrderItemDto(i.ProductName, i.Size, i.UnitPrice, i.Quantity)).ToList());

    private static async Task<IResult> GetSubscribers(AppDbContext db)
    {
        var contacts = await db.Contacts.OrderByDescending(c => c.SubscribedAt).ToListAsync();

        return Results.Ok(contacts.Select(c =>
            new AdminSubscriberDto(c.Id, c.Email, c.Unsubscribed, c.SubscribedAt, c.UnsubscribedAt)));
    }
}
