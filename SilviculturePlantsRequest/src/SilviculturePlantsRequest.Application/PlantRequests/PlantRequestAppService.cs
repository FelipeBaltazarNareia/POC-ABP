using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;

namespace SilviculturePlantsRequest.PlantRequests;

public class PlantRequestAppService : SilviculturePlantsRequestAppService, IPlantRequestAppService
{
    private readonly IRepository<PlantRequest, Guid> _plantRequestRepository;

    public PlantRequestAppService(IRepository<PlantRequest, Guid> plantRequestRepository)
    {
        _plantRequestRepository = plantRequestRepository;
    }

    public async Task<PlantRequestDto> CreateAsync(CreatePlantRequestDto input)
    {
        var entity = new PlantRequest(
            GuidGenerator.Create(),
            input.Week,
            input.Region,
            input.Company
        );

        await _plantRequestRepository.InsertAsync(entity, autoSave: true);

        return ObjectMapper.Map<PlantRequest, PlantRequestDto>(entity);
    }

    public async Task<List<PlantRequestDto>> GetListAsync()
    {
        var list = await _plantRequestRepository.GetListAsync();
        return ObjectMapper.Map<List<PlantRequest>, List<PlantRequestDto>>(list);
    }
}
