using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using PersonManagementExtension.Data;
using PersonManagementExtension.Services;
using PersonManagementExtension.Web.Controllers;
using PersonManagementExtension.Web.ViewModels;

namespace PersonManagementExtension.Web.Tests.Controllers;

public class RoleControllerTests
{
  private readonly IRoleService _service;
  private readonly RoleController _controller;

  public RoleControllerTests()
  {
    _service = Substitute.For<IRoleService>();
    
    _controller = new RoleController(_service);
  }

  [Fact]
  public async Task Get_ReturnsOkWithRoles()
  {
    // Arrange
    var roles = new List<Role>
    {
      new Role { Id = 1, Type = "User" },
      new Role { Id = 2, Type = "Admin" }
    };
    _service.GetAllAsync().Returns(roles);

    // Act
    var result = await _controller.Get();

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var returnedRoles = Assert.IsAssignableFrom<RoleViewModel[]>(okResult.Value);
    Assert.Equal(2, returnedRoles.Length);
    Assert.Contains(returnedRoles, r => r is { Id: 1, Type: "User" });
    Assert.Contains(returnedRoles, r => r is { Id: 2, Type: "Admin" });
  }
}