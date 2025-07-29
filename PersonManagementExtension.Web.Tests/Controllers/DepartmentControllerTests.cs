using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using PersonManagementExtension.Data;
using PersonManagementExtension.Services.Dtos;
using PersonManagementExtension.Services;
using PersonManagementExtension.Web.Controllers;
using PersonManagementExtension.Web.ViewModels;

namespace PersonManagementExtension.Web.Tests.Controllers;

public class DepartmentControllerTests
{
  private readonly IDepartmentService _service;
  private readonly DepartmentController _controller;

  public DepartmentControllerTests()
  {
    _service = Substitute.For<IDepartmentService>();

    _controller = new DepartmentController(_service);
  }

  [Fact]
  public async Task GetDepartments_ReturnsOkWithDepartments()
  {
    // Arrange
    var departments = new List<Department>
    {
      new Department { Id = 1, Name = "HR" },
      new Department { Id = 2, Name = "IT" }
    };
    _service.GetAllAsync().Returns(departments);

    // Act
    var result = await _controller.Get();

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var returnedDepartments = Assert.IsAssignableFrom<DepartmentViewModel[]>(okResult.Value);
    Assert.Equal(2, returnedDepartments.Length);
    Assert.Contains(returnedDepartments, d => d is { Id: (int)Roles.User, Name: "HR" });
    Assert.Contains(returnedDepartments, d => d is { Id: (int)Roles.Admin, Name: "IT" });
  }
}