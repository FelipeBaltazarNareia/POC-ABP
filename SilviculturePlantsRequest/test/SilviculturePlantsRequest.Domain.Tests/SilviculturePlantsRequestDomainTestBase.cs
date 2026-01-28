using Volo.Abp.Modularity;

namespace SilviculturePlantsRequest;

/* Inherit from this class for your domain layer tests. */
public abstract class SilviculturePlantsRequestDomainTestBase<TStartupModule> : SilviculturePlantsRequestTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
