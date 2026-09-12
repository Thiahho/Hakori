using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HakoriCo.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVariantMeasurements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ChestCm",
                table: "ProductVariants",
                type: "numeric(6,2)",
                precision: 6,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LengthCm",
                table: "ProductVariants",
                type: "numeric(6,2)",
                precision: 6,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SleeveCm",
                table: "ProductVariants",
                type: "numeric(6,2)",
                precision: 6,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChestCm",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "LengthCm",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "SleeveCm",
                table: "ProductVariants");
        }
    }
}
