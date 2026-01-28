using SilviculturePlantsRequest.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace SilviculturePlantsRequest.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class SilviculturePlantsRequestController : AbpControllerBase
{
    protected SilviculturePlantsRequestController()
    {
        LocalizationResource = typeof(SilviculturePlantsRequestResource);
    }
}
