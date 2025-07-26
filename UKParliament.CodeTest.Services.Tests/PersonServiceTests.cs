using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using UKParliament.CodeTest.Data;
using UKParliament.CodeTest.Services.Dtos;

namespace UKParliament.CodeTest.Services.Tests;

public class PersonServiceTests
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
    private static PersonService CreateService(PersonManagerContext context, out ILogger<PersonService> logger)
    {
        logger = Substitute.For<ILogger<PersonService>>();
        return new PersonService(context, logger);
    }

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsAllPeople()
    {
        var dbName = nameof(GetAllAsync_ReturnsAllPeople);
        await using var context = CreateInMemoryContext(dbName);

        var people = new List<Person>
        {
            new Person { FirstName = "Alice", LastName = "Smith", Email = "alice@example.com", Password = "pass1", Role = 1, Department = 1, DateOfBirth = new DateOnly(1990, 1, 1) },
            new Person { FirstName = "Bob", LastName = "Jones", Email = "bob@example.com", Password = "pass2", Role = 2, Department = 2, DateOfBirth = new DateOnly(1988, 5, 5) }
        };
        context.People.AddRange(people);
        await context.SaveChangesAsync();

        var service = CreateService(context, out _);

        var result = await service.GetAllAsync();

        Assert.Equal(2, result.Count);
        Assert.Contains(result, p => p.FirstName == "Alice");
        Assert.Contains(result, p => p.FirstName == "Bob");
    }

    #endregion

    #region GetAllDepartmentsAsync

    [Fact]
    public async Task GetAllDepartmentsAsync_ReturnsAllDepartments()
    {
        var dbName = nameof(GetAllDepartmentsAsync_ReturnsAllDepartments);
        await using var context = CreateInMemoryContext(dbName);

        var departments = new List<Department>
        {
            new Department { Name = "HR" },
            new Department { Name = "IT" }
        };
        context.Departments.AddRange(departments);
        await context.SaveChangesAsync();

        var service = CreateService(context, out _);

        var result = await service.GetAllDepartmentsAsync();

        Assert.Equal(2, result.Count);
        Assert.Contains(result, d => d.Name == "HR");
        Assert.Contains(result, d => d.Name == "IT");
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_ReturnsPerson_WhenFound()
    {
        var dbName = nameof(GetByIdAsync_ReturnsPerson_WhenFound);
        await using var context = CreateInMemoryContext(dbName);

        var person = new Person
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@test.com",
            Password = "testpass",
            Role = 1,
            Department = 3,
            DateOfBirth = new DateOnly(1970, 6, 15)
        };
        context.People.Add(person);
        await context.SaveChangesAsync();

        var service = CreateService(context, out _);

        var result = await service.GetByIdAsync(person.Id);

        Assert.NotNull(result);
        Assert.Equal(person.Id, result.Id);
        Assert.Equal("Test", result.FirstName);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        var dbName = nameof(GetByIdAsync_ReturnsNull_WhenNotFound);
        await using var context = CreateInMemoryContext(dbName);

        var service = CreateService(context, out _);

        var result = await service.GetByIdAsync(999); // Nonexistent Id

        Assert.Null(result);
    }

    #endregion

    #region AddAsync

    [Fact]
    public async Task AddAsync_AddsPerson_WhenPersonIsValid()
    {
        var dbName = nameof(AddAsync_AddsPerson_WhenPersonIsValid);
        await using var context = CreateInMemoryContext(dbName);

        var person = new Person
        {
            FirstName = "New",
            LastName = "User",
            Email = "newuser@example.com",
            Password = "password",
            Role = 1,
            Department = 4,
            DateOfBirth = new DateOnly(1999, 12, 31)
        };

        var service = CreateService(context, out _);
        var result = await service.AddAsync(person);

        Assert.NotNull(result.Data);
        Assert.True(result.Data!.Id > 0);
        Assert.Equal(StatusCodes.Success, result.StatusCode);

        var savedPerson = await context.People.FindAsync(result.Data.Id);
        Assert.NotNull(savedPerson);
        Assert.Equal("newuser@example.com", savedPerson.Email);
    }

    [Fact]
    public async Task AddAsync_ReturnsNullAndLogsWarning_WhenPersonHasId()
    {
        await using var context = CreateInMemoryContext(nameof(AddAsync_ReturnsNullAndLogsWarning_WhenPersonHasId));
        var service = CreateService(context, out var logger);

        var personWithId = new Person
        {
            Id = 1,
            FirstName = "Existing",
            LastName = "Person",
            Email = "exists@example.com",
            Password = "pass",
            Role = 1,
            Department = 2,
            DateOfBirth = new DateOnly(1990, 5, 20)
        };

        var result = await service.AddAsync(personWithId);

        Assert.Null(result.Data);
        Assert.Equal(StatusCodes.Success, result.StatusCode);
        logger.Received(1).LogWarning("New person must not have an ID.");
    }

    #endregion

    #region UpdateAsync

    [Fact]
    public async Task UpdateAsync_UpdatesPerson_WhenValid()
    {
        var dbName = nameof(UpdateAsync_UpdatesPerson_WhenValid);
        await using var context = CreateInMemoryContext(dbName);

        var person = new Person
        {
            FirstName = "Old",
            LastName = "Name",
            Email = "old@example.com",
            Password = "oldpass",
            Role = 1,
            Department = 2,
            DateOfBirth = new DateOnly(1987, 8, 15)
        };
        context.People.Add(person);
        await context.SaveChangesAsync();

        var updatedPerson = new Person
        {
            Id = person.Id,
            FirstName = "New",
            LastName = "Name",
            Email = "new@example.com",
            Password = "newpass",
            Role = 2,
            Department = 3,
            DateOfBirth = new DateOnly(1987, 8, 15)
        };

        var service = CreateService(context, out _);
        var result = await service.UpdateAsync(person.Id, updatedPerson);

        Assert.True(result.Data);
        Assert.Equal(StatusCodes.Success, result.StatusCode);

        var savedPerson = await context.People.FindAsync(person.Id);
        Assert.NotNull(savedPerson);
        Assert.Equal("New", savedPerson.FirstName);
        Assert.Equal("new@example.com", savedPerson.Email);
        Assert.Equal(2, savedPerson.Role);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFalse_WhenPersonNotFound()
    {
        var dbName = nameof(UpdateAsync_ReturnsFalse_WhenPersonNotFound);
        await using var context = CreateInMemoryContext(dbName);

        var service = CreateService(context, out _);

        var person = new Person
        {
            Id = 999,
            Email = "missing@example.com",
            FirstName = "Missing",
            LastName = "Person",
            Password = "pass",
            Role = 1,
            Department = 1,
            DateOfBirth = new DateOnly(1990, 1, 1)
        };

        var result = await service.UpdateAsync(999, person);

        Assert.False(result.Data);
    }

    #endregion

    #region DeleteAsync

    [Fact]
    public async Task DeleteAsync_DeletesPerson_WhenValid()
    {
        var dbName = nameof(DeleteAsync_DeletesPerson_WhenValid);
        await using var context = CreateInMemoryContext(dbName);

        var person = new Person
        {
            FirstName = "Delete",
            LastName = "Me",
            Email = "delete@me.com",
            Password = "delpass",
            Role = 1,
            Department = 1,
            DateOfBirth = new DateOnly(1992, 4, 4)
        };
        context.People.Add(person);
        await context.SaveChangesAsync();

        var service = CreateService(context, out _);

        var result = await service.DeleteAsync(person.Id, 4);

        Assert.True(result);
        var deleted = await context.People.FindAsync(person.Id);
        Assert.Null(deleted);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenPersonNotFound()
    {
        var dbName = nameof(DeleteAsync_ReturnsFalse_WhenPersonNotFound);
        await using var context = CreateInMemoryContext(dbName);

        var service = CreateService(context, out _);

        var result = await service.DeleteAsync(999, 4);

        Assert.False(result);
    }

    #endregion
}