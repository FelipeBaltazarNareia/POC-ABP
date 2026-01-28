using System.ComponentModel.DataAnnotations;

namespace SilviculturePlantsRequest.PlantRequests;

public class CreatePlantRequestDto
{
    [Required]
    [StringLength(64)]
    public string Week { get; set; } = null!;

    [Required]
    [StringLength(64)]
    public string Region { get; set; } = null!;

    [Required]
    [StringLength(256)]
    public string Company { get; set; } = null!;
}
