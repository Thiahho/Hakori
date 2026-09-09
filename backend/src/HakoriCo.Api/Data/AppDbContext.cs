using HakoriCo.Api.Admin.Identity;
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
