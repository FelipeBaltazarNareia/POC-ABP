using Volo.Abp.Modularity;

namespace SilviculturePlantsRequest;

[DependsOn(
    typeof(SilviculturePlantsRequestDomainModule),
    typeof(SilviculturePlantsRequestTestBaseModule)
)]
public class SilviculturePlantsRequestDomainTestModule : AbpModule
{

}
