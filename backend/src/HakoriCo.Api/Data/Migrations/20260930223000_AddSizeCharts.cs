using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HakoriCo.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSizeCharts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SizeCharts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SizeCharts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SizeChartRow",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SizeChartId = table.Column<Guid>(type: "uuid", nullable: false),
                    Size = table.Column<string>(type: "text", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    ChestCm = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                    LengthCm = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                    SleeveCm = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                    CurveUnits = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SizeChartRow", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SizeChartRow_SizeCharts_SizeChartId",
                        column: x => x.SizeChartId,
                        principalTable: "SizeCharts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SizeChartRow_SizeChartId",
                table: "SizeChartRow",
                column: "SizeChartId");

            migrationBuilder.CreateIndex(
                name: "IX_SizeCharts_Name",
                table: "SizeCharts",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SizeChartRow");

            migrationBuilder.DropTable(
                name: "SizeCharts");
        }
    }
}
