using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SilviculturePlantsRequest.Data;
using Volo.Abp.DependencyInjection;

namespace SilviculturePlantsRequest.EntityFrameworkCore;

public class EntityFrameworkCoreSilviculturePlantsRequestDbSchemaMigrator
    : ISilviculturePlantsRequestDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCoreSilviculturePlantsRequestDbSchemaMigrator(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolving the SilviculturePlantsRequestDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<SilviculturePlantsRequestDbContext>()
            .Database
            .MigrateAsync();
    }
}
