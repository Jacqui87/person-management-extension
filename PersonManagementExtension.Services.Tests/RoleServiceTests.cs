using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using PersonManagementExtension.Data;

namespace PersonManagementExtension.Services.Tests;

public class RoleServiceTests
{
    // Helper to create InMemory context isolated by database name
    private static PersonManagerContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<PersonManagerContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new PersonManagerContext(options);
    }

    // Helper to create service with mocked logger
    private static RoleService CreateService(PersonManagerContext context, out ILogger<RoleService> logger)
    {
        logger = Substitute.For<ILogger<RoleService>>();
        return new RoleService(context, logger);
    }

    #region GetAllAsync_ReturnsAllRoles

    [Fact]
    public async Task GetAllAsync_ReturnsAllRoles()
    {
      var dbName = nameof(GetAllAsync_ReturnsAllRoles);
      await using var context = CreateInMemoryContext(dbName);

      var roles = new List<Role>
      {
        new Role { Id = 1, Type = "Admin" },
        new Role { Id = 2, Type = "User" }
      };
      context.Roles.AddRange(roles);
      await context.SaveChangesAsync();

      var service = CreateService(context, out _);
      var result = await service.GetAllAsync();

      Assert.Equal(2, result.Count);
      Assert.Contains(result, r => r.Type == "Admin");
      Assert.Contains(result, r => r.Type == "User");
    }

    #endregion
}