using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SilviculturePlantsRequest.Migrations
{
    /// <inheritdoc />
    public partial class Added_PlantRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppPlantRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Week = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Region = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Company = table.Column<string>(type: "TEXT", maxLength: 256, nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    ExtraProperties = table.Column<string>(type: "TEXT", nullable: false),
                    ConcurrencyStamp = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatorId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppPlantRequests", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppPlantRequests");
        }
    }
}
