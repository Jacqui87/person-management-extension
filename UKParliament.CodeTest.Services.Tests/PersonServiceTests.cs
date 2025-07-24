using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using UKParliament.CodeTest.Data;

namespace UKParliament.CodeTest.Services.Tests;

public class PersonServiceTests
{
  // Helper to create fresh in-memory PersonManagerContext
  private static PersonManagerContext CreateInMemoryContext(string dbName)
  {
    var options = new DbContextOptionsBuilder<PersonManagerContext>()
      .UseInMemoryDatabase(databaseName: dbName)
      .Options;

    return new PersonManagerContext(options);
  }

  // Helper to create PersonService and mocked logger
  private static PersonService CreateService(PersonManagerContext context, out ILogger<PersonService> logger)
  {
    logger = Substitute.For<ILogger<PersonService>>();
    return new PersonService(context, logger);
  }

  [Fact]
  public async Task GetAllAsync_ReturnsPeople_WhenDataExists()
  {
    var dbName = nameof(GetAllAsync_ReturnsPeople_WhenDataExists);
    using var context = CreateInMemoryContext(dbName);

    var people = new List<Person>
    {
      new Person { FirstName = "Alice", Email = "alice@example.com", LastName = "Smith", Password = "pass1", Role = "User" },
      new Person { FirstName = "Bob", Email = "bob@example.com", LastName = "Jones", Password = "pass2", Role = "Admin" },
    };
    context.People.AddRange(people);
    await context.SaveChangesAsync();

    var service = CreateService(context, out _);

    var results = await service.GetAllAsync();

    Assert.Equal(2, results.Count);
    Assert.Contains(results, p => p.FirstName == "Alice");
    Assert.Contains(results, p => p.FirstName == "Bob");
  }

  [Fact]
  public async Task GetAllAsync_ReturnsEmptyList_WhenExceptionThrown()
  {
    var context = CreateInMemoryContext(nameof(GetAllAsync_ReturnsEmptyList_WhenExceptionThrown));
    await context.DisposeAsync(); // Dispose to cause exception on query

    var logger = Substitute.For<ILogger<PersonService>>();
    var service = new PersonService(context, logger);

    var results = await service.GetAllAsync();

    Assert.NotNull(results);
    Assert.Empty(results);
    logger.Received(1).LogError(Arg.Any<Exception>(), Arg.Is<string>(s => s.Contains("Error retrieving all people.")));
  }

  [Fact]
  public async Task GetAllDepartmentsAsync_ReturnsDepartments_WhenDataExists()
  {
    var dbName = nameof(GetAllDepartmentsAsync_ReturnsDepartments_WhenDataExists);
    using var context = CreateInMemoryContext(dbName);

    var departments = new List<Department>
    {
      new Department { Name = "HR" },
      new Department { Name = "IT" }
    };
    context.Departments.AddRange(departments);
    await context.SaveChangesAsync();

    var service = CreateService(context, out _);

    var results = await service.GetAllDepartmentsAsync();

    Assert.Equal(2, results.Count);
    Assert.Contains(results, d => d.Name == "HR");
    Assert.Contains(results, d => d.Name == "IT");
  }

  [Fact]
  public async Task GetAllDepartmentsAsync_ReturnsEmptyList_WhenExceptionThrown()
  {
    var context = CreateInMemoryContext(nameof(GetAllDepartmentsAsync_ReturnsEmptyList_WhenExceptionThrown));
    await context.DisposeAsync();

    var logger = Substitute.For<ILogger<PersonService>>();
    var service = new PersonService(context, logger);

    var results = await service.GetAllDepartmentsAsync();

    Assert.NotNull(results);
    Assert.Empty(results);
    logger.Received(1).LogError(Arg.Any<Exception>(), Arg.Is<string>(s => s.Contains("Error retrieving all departments.")));
  }

  [Fact]
  public async Task GetByIdAsync_ReturnsPerson_WhenFound()
  {
    var dbName = nameof(GetByIdAsync_ReturnsPerson_WhenFound);
    using var context = CreateInMemoryContext(dbName);

    var person = new Person { FirstName = "Test", Email = "test@test.com", LastName = "User", Password = "testpass", Role = "User" };
    context.People.Add(person);
    await context.SaveChangesAsync();

    var service = CreateService(context, out _);

    var result = await service.GetByIdAsync(person.Id);

    Assert.NotNull(result);
    Assert.Equal(person.Id, result!.Id);
    Assert.Equal("Test", result.FirstName);
  }

  [Fact]
  public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
  {
    var dbName = nameof(GetByIdAsync_ReturnsNull_WhenNotFound);
    using var context = CreateInMemoryContext(dbName);

    var service = CreateService(context, out _);

    var result = await service.GetByIdAsync(999);

    Assert.Null(result);
  }

  [Fact]
  public async Task GetByIdAsync_ReturnsNull_AndLogsError_WhenExceptionThrown()
  {
    var context = CreateInMemoryContext(nameof(GetByIdAsync_ReturnsNull_AndLogsError_WhenExceptionThrown));
    await context.DisposeAsync();

    var logger = Substitute.For<ILogger<PersonService>>();
    var service = new PersonService(context, logger);

    var result = await service.GetByIdAsync(1);

    Assert.Null(result);
    logger.Received(1).LogError(Arg.Any<Exception>(), Arg.Is<string>(s => s.Contains("Error retrieving person with ID")));
  }

  [Fact]
  public async Task AddAsync_AddsPerson_WhenEmailIsUnique()
  {
    var dbName = nameof(AddAsync_AddsPerson_WhenEmailIsUnique);
    using var context = CreateInMemoryContext(dbName);

    var person = new Person { Email = "unique@example.com", FirstName = "NewUser", LastName = "Test", Password = "newpass", Role = "User" };

    var service = CreateService(context, out _);

    var result = await service.AddAsync(person);

    Assert.NotNull(result);
    Assert.True(result!.Id > 0);

    var savedPerson = await context.People.FindAsync(result.Id);
    Assert.NotNull(savedPerson);
    Assert.Equal("unique@example.com", savedPerson!.Email);
  }

  [Fact]
  public async Task AddAsync_ReturnsNull_AndLogsWarning_WhenEmailNotUnique()
  {
    var dbName = nameof(AddAsync_ReturnsNull_AndLogsWarning_WhenEmailNotUnique);
    using var context = CreateInMemoryContext(dbName);

    var existing = new Person { Email = "duplicate@example.com", FirstName = "Existing", LastName = "User", Password = "existingpass", Role = "User" };
    context.People.Add(existing);
    await context.SaveChangesAsync();

    var newPerson = new Person { Email = "duplicate@example.com", FirstName = "New", LastName = "Person", Password = "newpass", Role = "User" };

    var logger = Substitute.For<ILogger<PersonService>>();
    var service = new PersonService(context, logger);

    var result = await service.AddAsync(newPerson);

    Assert.Null(result);
    logger.Received(1).LogWarning("Email {Email} is not unique.", "duplicate@example.com");
  }

  [Fact]
  public async Task UpdateAsync_ReturnsTrue_WhenPersonUpdatedSuccessfully()
  {
    var dbName = nameof(UpdateAsync_ReturnsTrue_WhenPersonUpdatedSuccessfully);
    using var context = CreateInMemoryContext(dbName);

    var person = new Person { Email = "unique2@example.com", FirstName = "Old", LastName = "Name", Password = "oldpass", Role = "User" };
    context.People.Add(person);
    await context.SaveChangesAsync();

    var updatedPerson = new Person
    {
      Id = person.Id,
      Email = "unique2@example.com",
      FirstName = "Updated",
      LastName = "Name",
      Role = "User",
      Password = "newpass",
      Department = 1,
      DateOfBirth = new DateOnly(1985, 5, 5)
    };

    var service = CreateService(context, out _);

    var result = await service.UpdateAsync(person.Id, updatedPerson);

    Assert.True(result);

    var savedPerson = await context.People.FindAsync(person.Id);
    Assert.NotNull(savedPerson);
    Assert.Equal("Updated", savedPerson!.FirstName);
    Assert.Equal("Name", savedPerson.LastName);
  }

  [Fact]
  public async Task UpdateAsync_ReturnsFalse_AndLogsWarning_WhenEmailNotUnique()
  {
    var dbName = nameof(UpdateAsync_ReturnsFalse_AndLogsWarning_WhenEmailNotUnique);
    using var context = CreateInMemoryContext(dbName);

    // Existing person with email
    var existing = new Person { Email = "used@example.com", FirstName = "Existing", LastName = "Person", Password = "existingpass", Role = "User" };
    context.People.Add(existing);
    await context.SaveChangesAsync();

    // Person to update with same email as existing (simulate duplicate)
    var personToEdit = new Person { Email = "checkme@example.com", FirstName = "Check", LastName = "Me", Password = "checkpass", Role = "User" };
    context.People.Add(personToEdit);
    await context.SaveChangesAsync();

    // Change email to one already used
    var updateModel = new Person { Email = "used@example.com", FirstName = "Updated", LastName = "Person", Password = "newpass", Role = "User" };

    var logger = Substitute.For<ILogger<PersonService>>();
    var service = new PersonService(context, logger);

    // We simulate IsEmailUniqueAsync returns false
    // But actual implementation queries DB, so need to add people accordingly

    // Since there's a person with "used@example.com" already, uniqueness fails
    var result = await service.UpdateAsync(personToEdit.Id, updateModel);

    Assert.False(result);
    logger.Received(1).LogWarning("Email {Email} is not unique.", "used@example.com");
  }

  [Fact]
  public async Task UpdateAsync_ReturnsFalse_WhenPersonNotFound()
  {
    var dbName = nameof(UpdateAsync_ReturnsFalse_WhenPersonNotFound);
    using var context = CreateInMemoryContext(dbName);

    var service = CreateService(context, out _);

    var result = await service.UpdateAsync(999, new Person { Email = "new@example.com", FirstName = "New", LastName = "Person", Password = "newpass", Role = "User" });

    Assert.False(result);
  }

  [Fact]
  public async Task DeleteAsync_ReturnsTrue_WhenPersonDeleted()
  {
    var dbName = nameof(DeleteAsync_ReturnsTrue_WhenPersonDeleted);
    using var context = CreateInMemoryContext(dbName);

    var person = new Person { Role = "user", FirstName = "Delete", LastName = "Me", Email = "aa@aa.com", Password = "deletepass" };
    context.People.Add(person);
    await context.SaveChangesAsync();

    var service = CreateService(context, out _);

    var result = await service.DeleteAsync(person.Id);

    Assert.True(result);

    var exists = await context.People.FindAsync(person.Id);
    Assert.Null(exists);
  }

  [Fact]
  public async Task DeleteAsync_ReturnsFalse_AndLogsWarning_WhenAttemptToDeleteAdmin()
  {
    var dbName = nameof(DeleteAsync_ReturnsFalse_AndLogsWarning_WhenAttemptToDeleteAdmin);
    using var context = CreateInMemoryContext(dbName);

    var adminPerson = new Person { Role = "admin", FirstName = "Admin", LastName = "User", Email = "aa@aa.com" , Password = "adminpass" };
    context.People.Add(adminPerson);
    await context.SaveChangesAsync();

    var logger = Substitute.For<ILogger<PersonService>>();
    var service = new PersonService(context, logger);

    var result = await service.DeleteAsync(adminPerson.Id);

    Assert.False(result);

    logger.Received(1).LogWarning("Attempted to delete admin user with ID {Id}.", adminPerson.Id);
  }

  [Fact]
  public async Task DeleteAsync_ReturnsFalse_WhenPersonNotFound()
  {
    var dbName = nameof(DeleteAsync_ReturnsFalse_WhenPersonNotFound);
    using var context = CreateInMemoryContext(dbName);

    var service = CreateService(context, out _);

    var result = await service.DeleteAsync(999);

    Assert.False(result);
  }

  [Fact]
  public async Task DeleteAsync_ReturnsFalse_AndLogsError_WhenExceptionThrown()
  {
    var context = CreateInMemoryContext(nameof(DeleteAsync_ReturnsFalse_AndLogsError_WhenExceptionThrown));
    await context.DisposeAsync();

    var logger = Substitute.For<ILogger<PersonService>>();
    var service = new PersonService(context, logger);

    var result = await service.DeleteAsync(1);

    Assert.False(result);
    logger.Received(1).LogError(Arg.Any<Exception>(), Arg.Is<string>(s => s.Contains("Error deleting person with ID")));
  }
}