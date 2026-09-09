using HakoriCo.Api.Products;
using Microsoft.EntityFrameworkCore;

namespace HakoriCo.Api.Data.Seed;

public static class DropOneSeeder
{
    private static readonly string[] Sizes = ["XS", "S", "M", "L", "XL", "XXL"];
    private const int InitialStockPerSize = 20;

    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Products.AnyAsync())
        {
            return;
        }

        var products = new[]
        {
            NewProduct(
                index: "01",
                slug: "katana-oversize",
                name: "Katana",
                price: 42000,
                description: "Oversize · Premium",
                image: "/images/katana-sinfondo.webp",
                storyImage: "/images/FINAL_KATANA.webp",
                storyQuote: "La verdadera batalla siempre es contra uno mismo.",
                storyText: "La katana representa el honor, la disciplina y la determinación. Más que un arma, simboliza el carácter de quien elige superarse cada día. Esta pieza es un recordatorio de que la fuerza más grande nace del autocontrol y la constancia.",
                sortOrder: 0,
                skuPrefix: "KATANA"),
            NewProduct(
                index: "02",
                slug: "torii-oversize",
                name: "Torii",
                price: 42000,
                description: "Oversize · Premium",
                image: "/images/TORI-sinfondo.webp",
                storyImage: "/images/FINALTORIH.webp",
                storyQuote: "Todo gran camino comienza con una decisión.",
                storyText: "El Torii marca el inicio de un nuevo recorrido. Representa el valor de dejar atrás los miedos, aceptar el cambio y dar el primer paso hacia el crecimiento personal. Cada gran historia comienza al cruzar una puerta.",
                sortOrder: 1,
                skuPrefix: "TORII"),
            NewProduct(
                index: "03",
                slug: "sakura-oversize",
                name: "Sakura",
                price: 42000,
                description: "Oversize · Premium",
                image: "/images/SAKURA-sinfondo.webp",
                storyImage: "/images/FINAL_Sakura.webp",
                storyQuote: "La belleza de la vida está en los momentos que no vuelven.",
                storyText: "El Sakura nos recuerda que todo es pasajero y que, precisamente por eso, cada instante tiene un valor único. Simboliza la renovación, la esperanza y la importancia de vivir el presente con gratitud.",
                sortOrder: 2,
                skuPrefix: "SAKURA"),
            NewProduct(
                index: "04",
                slug: "montefuji-oversize",
                name: "Monte Fuji",
                price: 42000,
                description: "Oversize · Premium",
                image: "/images/MONTE-sinfondo.webp",
                storyImage: "/images/FINAL_MONTEFUJIH.webp",
                storyQuote: "Las cimas pertenecen a quienes nunca dejan de avanzar.",
                storyText: "El Monte Fuji representa la perseverancia, la paciencia y la fortaleza para alcanzar grandes objetivos. Cada paso cuenta, y la verdadera grandeza se construye con constancia, incluso cuando el camino parece interminable.",
                sortOrder: 3,
                skuPrefix: "FUJI"),
        };

        db.Products.AddRange(products);
        await db.SaveChangesAsync();
    }

    private static Product NewProduct(
        string index,
        string slug,
        string name,
        decimal price,
        string description,
        string image,
        string storyImage,
        string storyQuote,
        string storyText,
        int sortOrder,
        string skuPrefix)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Index = index,
            Slug = slug,
            Name = name,
            Price = price,
            Description = description,
            Image = image,
            StoryImage = storyImage,
            StoryQuote = storyQuote,
            StoryText = storyText,
            SortOrder = sortOrder,
            IsActive = true,
        };

        product.Variants = Sizes.Select(size => new ProductVariant
        {
            Id = Guid.NewGuid(),
            Product = product,
            Size = size,
            Sku = $"{skuPrefix}-{size}",
            Stock = InitialStockPerSize,
            Reserved = 0,
        }).ToList();

        return product;
    }
}
