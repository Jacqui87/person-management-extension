using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using PersonManagementExtension.Data;
using PersonManagementExtension.Services;
using PersonManagementExtension.Services.Dtos;
using PersonManagementExtension.Web.Controllers;

namespace PersonManagementExtension.Web.Tests.Controllers;

public class AuthControllerTests
{
    private readonly IAuthService _authService = Substitute.For<IAuthService>();
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _controller = new AuthController(_authService);
    }

    [Fact]
    public async Task Get_ReturnsOkWithSessions()
    {
        // Arrange
        var sessions = new List<Session>
        {
            new Session { UserId = 1, Token = "token1" },
            new Session { UserId = 2, Token = "token2" }
        };
        _authService.GetAllSessionsAsync().Returns(Task.FromResult(sessions));

        // Act
        var result = await _controller.Get();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnSessions = Assert.IsAssignableFrom<List<Session>>(okResult.Value);
        Assert.Equal(2, returnSessions.Count);
    }

    [Fact]
    public async Task Login_ReturnsOkWithCredentials_WhenLoginSucceeds()
    {
        // Arrange
        var loginRequest = new LoginRequest { Email = "test@user.com", Password = "pass", Token = "" };
        var loginCredentials = new LoginCredentials
        {
            User = new Person { Email = loginRequest.Email, FirstName = "Test", LastName = "Last", Password = "pass", Role = 1 },
            Session = new Session { Token = "abc123" }
        };
        _authService.LoginAsync(loginRequest).Returns(Task.FromResult<LoginCredentials?>(loginCredentials));

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedCredentials = Assert.IsType<LoginCredentials>(okResult.Value);
        
        Assert.NotNull(returnedCredentials);
        Assert.NotNull(returnedCredentials.User);
        Assert.NotNull(returnedCredentials.Session);
        Assert.Equal(loginCredentials.User.Email, returnedCredentials.User.Email);
        Assert.Equal(loginCredentials.Session.Token, returnedCredentials.Session.Token);
    }

    [Fact]
    public async Task Login_ReturnsOkWithNull_WhenLoginFails()
    {
        // Arrange
        var loginRequest = new LoginRequest { Email = "fail@user.com", Password = "wrong", Token = "" };
        _authService.LoginAsync(loginRequest).Returns(Task.FromResult<LoginCredentials?>(null));

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Null(okResult.Value);
    }

    [Fact]
    public async Task Login_ReturnsInternalServerError_OnException()
    {
        // Arrange
        var loginRequest = new LoginRequest { Email = "error@user.com", Password = "error", Token = "" };
        _authService.LoginAsync(loginRequest).Returns<Task<LoginCredentials?>>(_ => throw new Exception("fail"));

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(500, objectResult.StatusCode);
        Assert.Equal("Internal server error", objectResult.Value);
    }
}