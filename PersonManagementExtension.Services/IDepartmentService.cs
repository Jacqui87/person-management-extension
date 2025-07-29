using PersonManagementExtension.Data;

namespace PersonManagementExtension.Services;

public interface IDepartmentService
{
    Task<List<Department>> GetAllAsync();
}