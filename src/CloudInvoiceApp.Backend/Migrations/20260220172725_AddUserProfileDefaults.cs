using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudInvoiceApp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfileDefaults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DefaultBankDetails",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DefaultFromAddress",
                table: "Users",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefaultBankDetails",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DefaultFromAddress",
                table: "Users");
        }
    }
}
