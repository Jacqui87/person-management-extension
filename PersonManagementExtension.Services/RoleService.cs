using PersonManagementExtension.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace PersonManagementExtension.Services;

public interface IRoleService
{
    Task<List<Role>> GetAllAsync();
}

public class RoleService(PersonManagerContext context, ILogger<RoleService> logger) : IRoleService
{
    public async Task<List<Role>> GetAllAsync()
    {
        try {
            return await context.Roles.ToListAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving all roles.");
            return new List<Role>();
        }
    }
}