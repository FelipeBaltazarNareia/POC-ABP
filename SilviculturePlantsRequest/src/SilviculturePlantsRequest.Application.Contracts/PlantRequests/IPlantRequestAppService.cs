using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace SilviculturePlantsRequest.PlantRequests;

public interface IPlantRequestAppService : IApplicationService
{
    Task<PlantRequestDto> CreateAsync(CreatePlantRequestDto input);
    Task<List<PlantRequestDto>> GetListAsync();
}
