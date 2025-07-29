using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using PersonManagementExtension.Data;

namespace PersonManagementExtension.Services.Tests;

public class DepartmentServiceTests
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
    private static DepartmentService CreateService(PersonManagerContext context, out ILogger<DepartmentService> logger)
    {
        logger = Substitute.For<ILogger<DepartmentService>>();
        return new DepartmentService(context, logger);
    }

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsAllDepartments()
    {
        var dbName = nameof(GetAllAsync_ReturnsAllDepartments);
        await using var context = CreateInMemoryContext(dbName);

        var departments = new List<Department>
        {
            new Department { Name = "HR" },
            new Department { Name = "IT" }
        };
        context.Departments.AddRange(departments);
        await context.SaveChangesAsync();

        var service = CreateService(context, out _);

        var result = await service.GetAllAsync();

        Assert.Equal(2, result.Count);
        Assert.Contains(result, d => d.Name == "HR");
        Assert.Contains(result, d => d.Name == "IT");
    }

    #endregion
}