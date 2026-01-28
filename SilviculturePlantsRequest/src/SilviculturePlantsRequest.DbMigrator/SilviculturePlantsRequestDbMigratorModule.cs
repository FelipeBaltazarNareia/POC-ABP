using SilviculturePlantsRequest.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace SilviculturePlantsRequest.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(SilviculturePlantsRequestEntityFrameworkCoreModule),
    typeof(SilviculturePlantsRequestApplicationContractsModule)
)]
public class SilviculturePlantsRequestDbMigratorModule : AbpModule
{
}
