using SilviculturePlantsRequest.Samples;
using Xunit;

namespace SilviculturePlantsRequest.EntityFrameworkCore.Domains;

[Collection(SilviculturePlantsRequestTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<SilviculturePlantsRequestEntityFrameworkCoreTestModule>
{

}
