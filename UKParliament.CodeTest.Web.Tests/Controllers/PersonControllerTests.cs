using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using UKParliament.CodeTest.Data;
using UKParliament.CodeTest.Services;
using UKParliament.CodeTest.Web.Controllers;
using UKParliament.CodeTest.Web.ViewModels;

namespace UKParliament.CodeTest.Web.Tests.Controllers
{
  public class PersonControllerTests
  {
    private readonly IPersonService _service;
    private readonly PersonController _controller;

    public PersonControllerTests()
    {
      _service = Substitute.For<IPersonService>();
      _controller = new PersonController(_service);
    }

    [Fact]
    public async Task Get_ReturnsOkWithPersonViewModels()
    {
      var people = new List<Person>
      {
        new Person
        {
          Id = 1,
          FirstName = "Alice",
          LastName = "Smith",
          Email = "alice@example.com",
          Role = "User",
          Department = 1,
          DateOfBirth = new DateOnly(1980, 1, 1),
          Password = "pass1"
        },
        new Person
        {
          Id = 2,
          FirstName = "Bob",
          LastName = "Jones",
          Email = "bob@example.com",
          Role = "Admin",
          Department = 2,
          DateOfBirth = new DateOnly(1990, 2, 2),
          Password = "pass2"
        }
      };

      _service.GetAllAsync().Returns(people);

      var actionResult = await _controller.Get();
      var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
      var resultValue = Assert.IsAssignableFrom<IEnumerable<PersonViewModel>>(okResult.Value);

      var resultList = resultValue.ToList();
      Assert.Equal(2, resultList.Count);

      // Verify first person
      Assert.Equal(1, resultList[0].Id);
      Assert.Equal("Alice", resultList[0].FirstName);
      Assert.Equal("Smith", resultList[0].LastName);
      Assert.Equal("alice@example.com", resultList[0].Email);
      Assert.Equal("User", resultList[0].Role);
      Assert.Equal(1, resultList[0].Department);
      Assert.Equal(new DateOnly(1980, 1, 1), resultList[0].DateOfBirth);
      Assert.Equal("pass1", resultList[0].Password);

      // Verify second person
      Assert.Equal(2, resultList[1].Id);
      Assert.Equal("Bob", resultList[1].FirstName);
      Assert.Equal("Jones", resultList[1].LastName);
      Assert.Equal("bob@example.com", resultList[1].Email);
      Assert.Equal("Admin", resultList[1].Role);
      Assert.Equal(2, resultList[1].Department);
      Assert.Equal(new DateOnly(1990, 2, 2), resultList[1].DateOfBirth);
      Assert.Equal("pass2", resultList[1].Password);
    }

    [Fact]
    public async Task GetDepartments_ReturnsOkWithDepartmentViewModels()
    {
      var departments = new List<Department>
      {
        new Department { Id = 1, Name = "HR" },
        new Department { Id = 2, Name = "IT" }
      };
      _service.GetAllDepartmentsAsync().Returns(departments);

      var actionResult = await _controller.GetDepartments();

      var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
      var resultValue = Assert.IsType<DepartmentViewModel[]>(okResult.Value);

      Assert.Equal(2, resultValue.Length);
      Assert.Equal(1, resultValue[0].Id);
      Assert.Equal("HR", resultValue[0].Name);
      Assert.Equal(2, resultValue[1].Id);
      Assert.Equal("IT", resultValue[1].Name);
    }

    [Fact]
    public async Task GetById_ReturnsOkWithPersonViewModel_WhenPersonExists()
    {
      var person = new Person
      {
        Id = 1,
        FirstName = "Alice",
        LastName = "Smith",
        Email = "alice@example.com",
        Role = "User",
        Department = 1,
        DateOfBirth = new DateOnly(1980, 1, 1),
        Password = "pass1"
      };

      _service.GetByIdAsync(1).Returns(person);

      var actionResult = await _controller.GetById(1);

      var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
      var resultValue = Assert.IsType<PersonViewModel>(okResult.Value);

      Assert.Equal(1, resultValue.Id);
      Assert.Equal("Alice", resultValue.FirstName);
      Assert.Equal("Smith", resultValue.LastName);
      Assert.Equal("alice@example.com", resultValue.Email);
      Assert.Equal("User", resultValue.Role);
      Assert.Equal(1, resultValue.Department);
      Assert.Equal(new DateOnly(1980, 1, 1), resultValue.DateOfBirth);
      Assert.Equal("pass1", resultValue.Password);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenPersonDoesNotExist()
    {
      _service.GetByIdAsync(42).Returns((Person?)null);

      var actionResult = await _controller.GetById(42);

      Assert.IsType<NotFoundResult>(actionResult.Result);
    }

    [Fact]
    public async Task AddPerson_ReturnsBadRequest_WhenPersonHasId()
    {
      var vm = new PersonViewModel
      {
        Id = 5,
        FirstName = "New",
        LastName = "Person",
        Role = "role",
        Email = "aa@aa.com",
        Password = "password"
      };

      var actionResult = await _controller.AddPerson(vm);

      var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult);
      Assert.Equal("New person must not have an ID.", badRequestResult.Value);
    }

    [Fact]
    public async Task AddPerson_ReturnsBadRequest_WhenAddAsyncReturnsNull()
    {
      var vm = new PersonViewModel
      {
        Id = 0,
        FirstName = "New",
        LastName = "Person",
        Role = "role",
        Email = "aa@aa.com",
        Password = "password"
      };

      _service.AddAsync(Arg.Any<Person>()).Returns(Task.FromResult<Person?>(null));

      var actionResult = await _controller.AddPerson(vm);

      var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult);
      Assert.Equal("Email must be unique.", badRequestResult.Value);
    }

    [Fact]
    public async Task AddPerson_ReturnsCreatedAtAction_WhenSuccessful()
    {
      var vm = new PersonViewModel
      {
        Id = 0,
        FirstName = "New",
        LastName = "Person",
        Email = "new@example.com",
        Role = "User",
        Department = 1,
        DateOfBirth = new DateOnly(2000, 1, 1),
        Password = "password"
      };

      var addedPerson = new Person
      {
        Id = 10,
        FirstName = vm.FirstName,
        LastName = vm.LastName,
        Email = vm.Email,
        Role = vm.Role,
        Department = vm.Department,
        DateOfBirth = vm.DateOfBirth,
        Password = vm.Password
      };
      _service.AddAsync(Arg.Any<Person>()).Returns(Task.FromResult(addedPerson));

      var actionResult = await _controller.AddPerson(vm);

      var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult);
      Assert.Equal(nameof(PersonController.GetById), createdResult.ActionName);

      var returnVm = Assert.IsType<PersonViewModel>(createdResult.Value);
      Assert.Equal(0, returnVm.Id); // Matches your controller returning original vm.Id
      Assert.Equal("New", returnVm.FirstName);
    }

    [Theory]
    [InlineData(0, 1)] // id <= 0
    [InlineData(2, 1)] // id != person.Id
    public async Task UpdatePerson_ReturnsBadRequest_OnInvalidId(int id, int personViewModelId)
    {
      var vm = new PersonViewModel
      {
        Id = personViewModelId,
        FirstName = "Update",
        LastName = "Person",
        Email = "update@example.com",
        Role = "User",
        Department = 1,
        DateOfBirth = new DateOnly(1995, 1, 1),
        Password = "pass"
      };

      var actionResult = await _controller.UpdatePerson(id, vm);

      var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult);
      Assert.Equal("ID in URL and payload must match and be greater than 0.", badRequestResult.Value);
    }

    [Fact]
    public async Task UpdatePerson_ReturnsNotFound_WhenServiceUpdateFails()
    {
      var vm = new PersonViewModel
      {
        Id = 1,
        FirstName = "Update",
        LastName = "Person",
        Email = "update@example.com",
        Role = "User",
        Department = 1,
        DateOfBirth = new DateOnly(1995, 1, 1),
        Password = "pass"
      };

      _service.UpdateAsync(1, Arg.Any<Person>()).Returns(false);

      var actionResult = await _controller.UpdatePerson(1, vm);

      Assert.IsType<NotFoundResult>(actionResult);
    }

    [Fact]
    public async Task UpdatePerson_ReturnsNoContent_WhenUpdateSucceeds()
    {
      var vm = new PersonViewModel
      {
        Id = 1,
        FirstName = "Update",
        LastName = "Person",
        Email = "update@example.com",
        Role = "User",
        Department = 1,
        DateOfBirth = new DateOnly(1995, 1, 1),
        Password = "pass"
      };

      _service.UpdateAsync(1, Arg.Any<Person>()).Returns(true);

      var actionResult = await _controller.UpdatePerson(1, vm);

      Assert.IsType<NoContentResult>(actionResult);
    }

    [Fact]
    public async Task DeletePerson_ReturnsNotFound_WhenDeleteFails()
    {
      _service.DeleteAsync(123).Returns(false);

      var actionResult = await _controller.DeletePerson(123);

      Assert.IsType<NotFoundResult>(actionResult);
    }

    [Fact]
    public async Task DeletePerson_ReturnsNoContent_WhenDeleteSucceeds()
    {
      _service.DeleteAsync(123).Returns(true);

      var actionResult = await _controller.DeletePerson(123);

      Assert.IsType<NoContentResult>(actionResult);
    }
  }
}