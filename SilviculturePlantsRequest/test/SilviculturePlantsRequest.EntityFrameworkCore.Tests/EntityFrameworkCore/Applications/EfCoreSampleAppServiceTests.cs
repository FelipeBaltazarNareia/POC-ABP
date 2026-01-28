using SilviculturePlantsRequest.Samples;
using Xunit;

namespace SilviculturePlantsRequest.EntityFrameworkCore.Applications;

[Collection(SilviculturePlantsRequestTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<SilviculturePlantsRequestEntityFrameworkCoreTestModule>
{

}
