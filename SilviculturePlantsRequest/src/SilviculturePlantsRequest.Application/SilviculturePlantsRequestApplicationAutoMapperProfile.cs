using AutoMapper;
using SilviculturePlantsRequest.PlantRequests;

namespace SilviculturePlantsRequest;

public class SilviculturePlantsRequestApplicationAutoMapperProfile : Profile
{
    public SilviculturePlantsRequestApplicationAutoMapperProfile()
    {
        CreateMap<PlantRequest, PlantRequestDto>();
    }
}
