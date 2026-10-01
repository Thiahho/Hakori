using HakoriCo.Api.Admin.Identity;
using HakoriCo.Api.Coupons;
using HakoriCo.Api.Newsletter;
using HakoriCo.Api.Orders;
using HakoriCo.Api.Products;
using Microsoft.AspNetCore.Identity;
using CartAggregate = HakoriCo.Api.Cart.Cart;
using CartItem = HakoriCo.Api.Cart.CartItem;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<AdminUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<CartAggregate> Carts => Set<CartAggregate>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<SizeChart> SizeCharts => Set<SizeChart>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Product>(entity =>
        {
            entity.HasIndex(p => p.Slug).IsUnique();
            entity.Property(p => p.Price).HasPrecision(10, 2);
        });

        builder.Entity<ProductVariant>(entity =>
        {
            entity.HasIndex(v => v.Sku).IsUnique();
            entity.Property(v => v.ChestCm).HasPrecision(6, 2);
            entity.Property(v => v.LengthCm).HasPrecision(6, 2);
            entity.Property(v => v.SleeveCm).HasPrecision(6, 2);
            entity.HasOne(v => v.Product)
                .WithMany(p => p.Variants)
                .HasForeignKey(v => v.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Contact>(entity =>
        {
            entity.HasIndex(c => c.Email).IsUnique();
        });

        builder.Entity<CartAggregate>(entity =>
        {
            entity.HasIndex(c => c.Token).IsUnique();
            entity.HasOne(c => c.Coupon)
                .WithMany()
                .HasForeignKey(c => c.CouponId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<CartItem>(entity =>
        {
            entity.HasOne(i => i.Cart)
                .WithMany(c => c.Items)
                .HasForeignKey(i => i.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(i => i.ProductVariant)
                .WithMany()
                .HasForeignKey(i => i.ProductVariantId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Order>(entity =>
        {
            entity.HasIndex(o => o.OrderNumber).IsUnique();
            entity.Property(o => o.Total).HasPrecision(10, 2);
            entity.Property(o => o.Subtotal).HasPrecision(10, 2);
            entity.Property(o => o.DiscountAmount).HasPrecision(10, 2);
            entity.HasOne<Coupon>()
                .WithMany()
                .HasForeignKey(o => o.CouponId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<SizeChart>(entity =>
        {
            entity.HasIndex(c => c.Name).IsUnique();
        });

        builder.Entity<SizeChartRow>(entity =>
        {
            entity.Property(r => r.ChestCm).HasPrecision(6, 2);
            entity.Property(r => r.LengthCm).HasPrecision(6, 2);
            entity.Property(r => r.SleeveCm).HasPrecision(6, 2);
            entity.HasOne(r => r.SizeChart)
                .WithMany(c => c.Rows)
                .HasForeignKey(r => r.SizeChartId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Coupon>(entity =>
        {
            entity.HasIndex(c => c.Code).IsUnique();
            entity.Property(c => c.Value).HasPrecision(10, 2);
            entity.Property(c => c.DiscountType).HasConversion<string>().HasMaxLength(20);
        });

        builder.Entity<OrderItem>(entity =>
        {
            entity.Property(i => i.UnitPrice).HasPrecision(10, 2);
            entity.HasOne(i => i.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
