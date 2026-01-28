using Microsoft.Extensions.Localization;
using SilviculturePlantsRequest.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace SilviculturePlantsRequest;

[Dependency(ReplaceServices = true)]
public class SilviculturePlantsRequestBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<SilviculturePlantsRequestResource> _localizer;

    public SilviculturePlantsRequestBrandingProvider(IStringLocalizer<SilviculturePlantsRequestResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
