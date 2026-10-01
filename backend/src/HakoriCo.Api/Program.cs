using HakoriCo.Api.Admin.Identity;
using HakoriCo.Api.Cart;
using HakoriCo.Api.Coupons;
using HakoriCo.Api.Data;
using HakoriCo.Api.Data.Seed;
using HakoriCo.Api.Newsletter;
using HakoriCo.Api.Orders;
using HakoriCo.Api.Orders.Payments;
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
builder.Services.AddScoped<CouponService>();
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
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = true;

    // The admin UI lives in Next.js now, not in server-rendered Razor pages,
    // so an unauthenticated/unauthorized request is always a JSON API call
    // (from Next.js' server, never a browser navigation) — respond with a
    // plain status code instead of the default redirect-to-login-page HTML flow.
    options.Events.OnRedirectToLogin = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole(AdminSeeder.AdminRole));
});

// With <Nullable>enable</Nullable>, MVC would treat every non-nullable string in the
// request records as [Required] and short-circuit with a generic 400 ProblemDetails;
// the actions do their own validation and return Spanish, user-facing messages.
// Bare NotFound()/BadRequest() keep an empty body instead of a ProblemDetails payload.
builder.Services.AddControllers(options =>
        options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true)
    .ConfigureApiBehaviorOptions(options => options.SuppressMapClientErrors = true);

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
app.MapControllers();

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
