using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HakoriCo.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNewsletterContacts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Contacts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Unsubscribed = table.Column<bool>(type: "boolean", nullable: false),
                    SubscribedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UnsubscribedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ResendContactId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contacts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_Email",
                table: "Contacts",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Contacts");
        }
    }
}
