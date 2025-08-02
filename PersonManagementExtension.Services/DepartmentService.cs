using PersonManagementExtension.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace PersonManagementExtension.Services;

public interface IDepartmentService
{
    Task<List<Department>> GetAllAsync();
}

public class DepartmentService(PersonManagerContext context, ILogger<DepartmentService> logger) : IDepartmentService
{
    public async Task<List<Department>> GetAllAsync()
    {
        try {
            return await context.Departments.ToListAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving all departments.");
            return new List<Department>();
        }
    }
}