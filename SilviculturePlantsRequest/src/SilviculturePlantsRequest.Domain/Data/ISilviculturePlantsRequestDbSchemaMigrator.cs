using System.Threading.Tasks;

namespace SilviculturePlantsRequest.Data;

public interface ISilviculturePlantsRequestDbSchemaMigrator
{
    Task MigrateAsync();
}
