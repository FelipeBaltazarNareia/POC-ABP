using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace SilviculturePlantsRequest.EntityFrameworkCore;

/* This class is needed for EF Core console commands
 * (like Add-Migration and Update-Database commands) */
public class SilviculturePlantsRequestDbContextFactory : IDesignTimeDbContextFactory<SilviculturePlantsRequestDbContext>
{
    public SilviculturePlantsRequestDbContext CreateDbContext(string[] args)
    {
        var configuration = BuildConfiguration();
        
        SilviculturePlantsRequestEfCoreEntityExtensionMappings.Configure();

        var builder = new DbContextOptionsBuilder<SilviculturePlantsRequestDbContext>()
            .UseSqlite(configuration.GetConnectionString("Default"));
        
        return new SilviculturePlantsRequestDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../SilviculturePlantsRequest.DbMigrator/"))
            .AddJsonFile("appsettings.json", optional: false);

        return builder.Build();
    }
}
