using SilviculturePlantsRequest.Localization;
using Volo.Abp.Application.Services;

namespace SilviculturePlantsRequest;

/* Inherit your application services from this class.
 */
public abstract class SilviculturePlantsRequestAppService : ApplicationService
{
    protected SilviculturePlantsRequestAppService()
    {
        LocalizationResource = typeof(SilviculturePlantsRequestResource);
    }
}
