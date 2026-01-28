using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace SilviculturePlantsRequest.PlantRequests;

public class PlantRequest : CreationAuditedAggregateRoot<Guid>
{
    public string Week { get; set; } = null!;
    public string Region { get; set; } = null!;
    public string Company { get; set; } = null!;
    public PlantRequestStatus Status { get; set; }

    protected PlantRequest() { }

    public PlantRequest(Guid id, string week, string region, string company)
        : base(id)
    {
        Week = week;
        Region = region;
        Company = company;
        Status = PlantRequestStatus.Pending;
    }
}
