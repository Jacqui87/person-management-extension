using PersonManagementExtension.Data;

namespace PersonManagementExtension.Services;

public interface IRoleService
{
    Task<List<Role>> GetAllAsync();
}