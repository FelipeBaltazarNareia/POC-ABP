using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace SilviculturePlantsRequest.Data;

/* This is used if database provider does't define
 * ISilviculturePlantsRequestDbSchemaMigrator implementation.
 */
public class NullSilviculturePlantsRequestDbSchemaMigrator : ISilviculturePlantsRequestDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
