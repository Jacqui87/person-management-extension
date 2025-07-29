using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using PersonManagementExtension.Data;
using PersonManagementExtension.Services.Dtos;

namespace PersonManagementExtension.Services.Tests;

public class AuthServiceTests
{
  // Helper to create fresh in-memory context with unique DB name per test for isolation
  private static PersonManagerContext CreateInMemoryContext(string dbName)
  {
    var options = new DbContextOptionsBuilder<PersonManagerContext>()
      .UseInMemoryDatabase(databaseName: dbName)
      .Options;

    return new PersonManagerContext(options);
  }

  // Helper to create AuthService with mocked logger and provided context
  private AuthService CreateService(PersonManagerContext context, ILogger<AuthService> logger)
  {
    return new AuthService(context, logger);
  }

  [Fact]
  public async Task LoginAsync_ReturnsCredentials_AndCreatesSession_WhenCredentialsValid()
  {
    var dbName = nameof(LoginAsync_ReturnsCredentials_AndCreatesSession_WhenCredentialsValid);
    await using var context = CreateInMemoryContext(dbName);

    // Arrange user
    var user = new Person
    {
      FirstName = "Jane",
      LastName = "Doe",
      Email = "jane.doe@example.com",
      Password = "Secret123!",
      Role = 2,
      Department = 1,
      DateOfBirth = new DateOnly(1990, 1, 1)
    };
    context.People.Add(user);
    await context.SaveChangesAsync();

    var logger = Substitute.For<ILogger<AuthService>>();
    var service = CreateService(context, logger);

        var request = new LoginRequest { Email = user.Email, Password = user.Password };

    // Act
    var result = await service.LoginAsync(request);

    // Assert
    Assert.NotNull(result);
    Assert.NotNull(result.User);
    Assert.NotNull(result.Session);
    Assert.Equal(user.Email, result.User.Email);
    Assert.Equal(user.FirstName, result.User.FirstName);
    Assert.False(string.IsNullOrWhiteSpace(result.Session.Token));
    Assert.Equal(user.Id, result.Session.UserId);

    // The session should be saved in DB
    var savedSession = await context.Sessions.FirstOrDefaultAsync(s => s.UserId == user.Id);
    Assert.NotNull(savedSession);
    Assert.Equal(result.Session.Token, savedSession.Token);
  }

  [Fact]
  public async Task LoginAsync_ReturnsNull_WhenPasswordIncorrect()
  {
    var dbName = nameof(LoginAsync_ReturnsNull_WhenPasswordIncorrect);
    await using var context = CreateInMemoryContext(dbName);

    // Arrange user with correct credentials
    var user = new Person
    {
      Email = "user@example.com", Password = "correctpass", FirstName = "User", Role = 1, LastName = "Test"
    };
    context.People.Add(user);
    await context.SaveChangesAsync();

    var logger = Substitute.For<ILogger<AuthService>>();
    var service = CreateService(context, logger);

    var request = new LoginRequest { Email = user.Email, Password = "wrongpass" };

    // Act
    var result = await service.LoginAsync(request);

    // Assert
    Assert.Null(result);

    // No session should be created
    Assert.Empty(context.Sessions);
  }

  [Fact]
  public async Task LoginAsync_ReturnsNull_WhenEmailNotFound()
  {
    var dbName = nameof(LoginAsync_ReturnsNull_WhenEmailNotFound);
    await using var context = CreateInMemoryContext(dbName);

    var logger = Substitute.For<ILogger<AuthService>>();
    var service = CreateService(context, logger);

    var request = new LoginRequest { Email = "nonexistent@example.com", Password = "any" };

    var result = await service.LoginAsync(request);

    Assert.Null(result);
  }

  [Fact]
  public async Task GetAllSessionsAsync_ReturnsAllSessions()
  {
    var dbName = nameof(GetAllSessionsAsync_ReturnsAllSessions);
    await using var context = CreateInMemoryContext(dbName);

    // Arrange some sessions
    context.Sessions.AddRange(
      new Session { UserId = 1, Token = Guid.NewGuid().ToString() },
      new Session { UserId = 2, Token = Guid.NewGuid().ToString() });
    await context.SaveChangesAsync();

    var logger = Substitute.For<ILogger<AuthService>>();
    var service = CreateService(context, logger);

    // Act
    var sessions = await service.GetAllSessionsAsync();

    // Assert
    Assert.Equal(2, sessions.Count);
  }
}