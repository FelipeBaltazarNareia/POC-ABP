using SilviculturePlantsRequest.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;
using Volo.Abp.MultiTenancy;

namespace SilviculturePlantsRequest.Permissions;

public class SilviculturePlantsRequestPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(SilviculturePlantsRequestPermissions.GroupName);

        //Define your own permissions here. Example:
        //myGroup.AddPermission(SilviculturePlantsRequestPermissions.MyPermission1, L("Permission:MyPermission1"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<SilviculturePlantsRequestResource>(name);
    }
}
