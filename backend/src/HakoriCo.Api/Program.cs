using HakoriCo.Api.Admin;
using HakoriCo.Api.Admin.Identity;
using HakoriCo.Api.Cart;
using HakoriCo.Api.Data;
using HakoriCo.Api.Data.Seed;
using HakoriCo.Api.Newsletter;
using HakoriCo.Api.Orders;
using HakoriCo.Api.Orders.Payments;
using HakoriCo.Api.Products;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "Frontend";

var connectionString = builder.Configuration.GetConnectionString("Default");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString ?? string.Empty, name: "postgres");

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.Configure<ResendOptions>(builder.Configuration.GetSection("Resend"));
builder.Services.AddHttpClient<IResendClient, ResendClient>(client =>
{
    client.BaseAddress = new Uri("https://api.resend.com/");
});

builder.Services.AddScoped<CartAccessor>();
builder.Services.AddScoped<StockService>();
builder.Services.Configure<MercadoPagoOptions>(builder.Configuration.GetSection("MercadoPago"));
builder.Services.AddScoped<IMercadoPagoClient, MercadoPagoClient>();
builder.Services.AddHostedService<OrderExpirationService>();

builder.Services
    .AddIdentity<AdminUser, IdentityRole<Guid>>(options =>
    {
        options.Password.RequiredLength = 8;
        options.Password.RequireNonAlphanumeric = false;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "hakori_admin";
    options.LoginPath = "/Admin/Login";
    options.AccessDeniedPath = "/Admin/Login";
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = true;
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole(AdminSeeder.AdminRole));
});

builder.Services.AddRazorPages(options =>
{
    options.Conventions.AuthorizeFolder("/Admin", "RequireAdminRole");
    options.Conventions.AllowAnonymousToPage("/Admin/Login");
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors(FrontendCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapProductsEndpoints();
app.MapNewsletterEndpoints();
app.MapCartEndpoints();
app.MapOrdersEndpoints();
app.MapPaymentWebhookEndpoint();
app.MapAdminAuthEndpoints();
app.MapRazorPages();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (app.Environment.IsDevelopment())
    {
        await DropOneSeeder.SeedAsync(db);
    }

    await AdminSeeder.SeedAsync(scope.ServiceProvider, app.Configuration);
}

app.Run();
