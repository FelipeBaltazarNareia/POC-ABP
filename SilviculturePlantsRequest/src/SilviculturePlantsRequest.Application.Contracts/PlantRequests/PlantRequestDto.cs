using System;
using Volo.Abp.Application.Dtos;

namespace SilviculturePlantsRequest.PlantRequests;

public class PlantRequestDto : CreationAuditedEntityDto<Guid>
{
    public string Week { get; set; } = null!;
    public string Region { get; set; } = null!;
    public string Company { get; set; } = null!;
    public PlantRequestStatus Status { get; set; }
}
