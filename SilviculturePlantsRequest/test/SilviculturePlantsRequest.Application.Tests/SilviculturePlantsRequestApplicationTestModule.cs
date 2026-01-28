using Volo.Abp.Modularity;

namespace SilviculturePlantsRequest;

[DependsOn(
    typeof(SilviculturePlantsRequestApplicationModule),
    typeof(SilviculturePlantsRequestDomainTestModule)
)]
public class SilviculturePlantsRequestApplicationTestModule : AbpModule
{

}
