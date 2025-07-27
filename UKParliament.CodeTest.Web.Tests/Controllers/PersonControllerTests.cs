using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using UKParliament.CodeTest.Data;
using UKParliament.CodeTest.Services.Dtos;
using UKParliament.CodeTest.Services;
using UKParliament.CodeTest.Web.Controllers;
using UKParliament.CodeTest.Web.ViewModels;

namespace UKParliament.CodeTest.Web.Tests.Controllers;

public class PersonControllerTests
{
  private readonly IPersonService _personService;
  private readonly IAuthService _authService;
  private readonly PersonController _controller;

  public PersonControllerTests()
  {
    _personService = Substitute.For<IPersonService>();
    _authService = Substitute.For<IAuthService>();

    _controller = new PersonController(_authService, _personService);
  }

  [Fact]
  public async Task Get_ReturnsOkWithAllPeople_FullFields()
  {
    // Arrange
    var people = new List<Person>
    {
      new Person
      {
        Id = 1,
        FirstName = "John",
        LastName = "Doe",
        Role = 1,
        Email = "john.doe@example.com",
        Password = "pass123",
        Department = 2,
        DateOfBirth = new DateOnly(1980, 5, 15)
      },
      new Person
      {
        Id = 2,
        FirstName = "Jane",
        LastName = "Smith",
        Role = 2,
        Email = "jane.smith@example.com",
        Password = "securepwd",
        Department = 1,
        DateOfBirth = new DateOnly(1990, 11, 22)
      }
    };
    _personService.GetAllAsync().Returns(people);

    // Act
    var result = await _controller.Get();

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var returnedPeople = Assert.IsAssignableFrom<IEnumerable<PersonViewModel>>(okResult.Value);
    Assert.NotNull(returnedPeople);
    Assert.Equal(2, returnedPeople.Count());

    var john = returnedPeople.First(p => p.Id == (int)Roles.User);
    Assert.Equal("John", john.FirstName);
    Assert.Equal("Doe", john.LastName);
    Assert.Equal(1, john.Role);
    Assert.Equal("john.doe@example.com", john.Email);
    Assert.Equal("pass123", john.Password);
    Assert.Equal(2, john.Department);
    Assert.Equal(new DateOnly(1980, 5, 15), john.DateOfBirth);

    var jane = returnedPeople.First(p => p.Id == (int)Roles.Admin);
    Assert.Equal("Jane", jane.FirstName);
    Assert.Equal("Smith", jane.LastName);
    Assert.Equal(2, jane.Role);
    Assert.Equal("jane.smith@example.com", jane.Email);
    Assert.Equal("securepwd", jane.Password);
    Assert.Equal(1, jane.Department);
    Assert.Equal(new DateOnly(1990, 11, 22), jane.DateOfBirth);
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
    _personService.GetAllDepartmentsAsync().Returns(departments);

    // Act
    var result = await _controller.GetDepartments();

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var returnedDepartments = Assert.IsAssignableFrom<DepartmentViewModel[]>(okResult.Value);
    Assert.Equal(2, returnedDepartments.Length);
    Assert.Contains(returnedDepartments, d => d.Id == (int)Roles.User && d.Name == "HR");
    Assert.Contains(returnedDepartments, d => d.Id == (int)Roles.Admin && d.Name == "IT");
  }

  [Fact]
public async Task GetRoles_ReturnsOkWithRoles()
{
    // Arrange
    var roles = new List<Role>
    {
        new Role { Id = 1, Type = "User" },
        new Role { Id = 2, Type = "Admin" }
    };
    _personService.GetAllRolesAsync().Returns(roles);

    // Act
    var result = await _controller.GetRoles();

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var returnedRoles = Assert.IsAssignableFrom<RoleViewModel[]>(okResult.Value);
    Assert.Equal(2, returnedRoles.Length);
    Assert.Contains(returnedRoles, r => r.Id == 1 && r.Type == "User");
    Assert.Contains(returnedRoles, r => r.Id == 2 && r.Type == "Admin");
}

  [Fact]
  public async Task GetById_ReturnsNotFound_WhenPersonIsNull()
  {
    // Arrange
    _personService.GetByIdAsync(Arg.Any<int>()).Returns((Person?)null);

    // Act
    var result = await _controller.GetById(1);

    // Assert
    Assert.IsType<NotFoundResult>(result.Result);
  }

  [Fact]
  public async Task GetById_ReturnsOkWithPerson_FullFields()
  {
    // Arrange
    var person = new Person
    {
      Id = 1,
      FirstName = "Alice",
      LastName = "Walker",
      Role = 1,
      Email = "alice.walker@example.com",
      Password = "alicepwd",
      Department = 3,
      DateOfBirth = new DateOnly(1985, 2, 3)
    };
    _personService.GetByIdAsync(1).Returns(person);

    // Act
    var result = await _controller.GetById(1);

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var returnedPerson = Assert.IsType<PersonViewModel>(okResult.Value);
    Assert.Equal(person.Id, returnedPerson.Id);
    Assert.Equal(person.FirstName, returnedPerson.FirstName);
    Assert.Equal(person.LastName, returnedPerson.LastName);
    Assert.Equal(person.Role, returnedPerson.Role);
    Assert.Equal(person.Email, returnedPerson.Email);
    Assert.Equal(person.Password, returnedPerson.Password);
    Assert.Equal(person.Department, returnedPerson.Department);
    Assert.Equal(person.DateOfBirth, returnedPerson.DateOfBirth);
  }

  [Fact]
  public async Task AddPerson_ReturnsOkWithCreatedPerson()
  {
    // Arrange
    var personViewModel = new PersonViewModel
    {
      Id = 0, // Assuming 0 for a new person
      FirstName = "Emma",
      LastName = "Brown",
      Email = "emma.brown@example.com",
      Password = "StrongPassword123",
      Role = 1,
      Department = 2,
      DateOfBirth = new DateOnly(1992, 3, 15),
      Biography = "Some bio text"
    };

    var createdPerson = new Person
    {
      Id = 10,
      FirstName = personViewModel.FirstName,
      LastName = personViewModel.LastName,
      Email = personViewModel.Email,
      Password = personViewModel.Password,
      Role = personViewModel.Role,
      Department = personViewModel.Department,
      DateOfBirth = personViewModel.DateOfBirth,
      Biography = personViewModel.Biography
    };

    var serviceResult = new ServiceResult<Person?>
    {
      StatusCode = StatusCodes.Success,
      Data = createdPerson
    };

    _personService.AddAsync(Arg.Any<Person>()).Returns(serviceResult);

    // Act
    var result = await _controller.AddPerson(personViewModel);

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var returnedPerson = Assert.IsType<Person>(okResult.Value);

    Assert.Equal(createdPerson.Id, returnedPerson.Id);
    Assert.Equal(createdPerson.FirstName, returnedPerson.FirstName);
    Assert.Equal(createdPerson.LastName, returnedPerson.LastName);
    Assert.Equal(createdPerson.Email, returnedPerson.Email);
    Assert.Equal(createdPerson.Password, returnedPerson.Password);
    Assert.Equal(createdPerson.Role, returnedPerson.Role);
    Assert.Equal(createdPerson.Department, returnedPerson.Department);
    Assert.Equal(createdPerson.DateOfBirth, returnedPerson.DateOfBirth);
    Assert.Equal(createdPerson.Biography, returnedPerson.Biography);
  }

  [Fact]
  public async Task UpdatePerson_ReturnsOkWithTrue()
  {
    // Arrange
    var serviceResult = new ServiceResult<bool>
    {
      StatusCode = StatusCodes.Success,
      Data = true
    };
    var personViewModel = new PersonViewModel
    {
      Id = 1,
      FirstName = "Updated",
      LastName = "Name",
      Role = 1,
      Email = "updated.email@example.com",
      Password = "newpassword",
      Department = 4,
      DateOfBirth = new DateOnly(1995, 7, 7)
    };

    _personService.UpdateAsync(1, Arg.Any<Person>()).Returns(serviceResult);

    // Act
    var result = await _controller.UpdatePerson(1, personViewModel);

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var returnedValue = Assert.IsType<bool>(okResult.Value);
    Assert.True(returnedValue);
  }

  [Fact]
  public async Task DeletePerson_SuccessfulDeletion_ReturnsNoContent()
  {
    // Arrange
    var idToDelete = 7;
    var user = new Person
    {
      Id = 99,
      FirstName = "Test",
      LastName = "User",
      Role = 1,
      Email = "testuser@example.com",
      Password = "Password123!",
      Biography = "Test biography",
      Department = 2,
      DateOfBirth = DateOnly.Parse("1980-01-01")
    };

    _authService.GetMostRecentUserAsync().Returns(Task.FromResult<Person?>(user));
    _personService.DeleteAsync(idToDelete, user.Id).Returns(Task.FromResult(true));

    // Act
    var result = await _controller.DeletePerson(idToDelete);

    // Assert
    Assert.IsType<NoContentResult>(result);
  }

  [Fact]
  public async Task DeletePerson_UnsuccessfulDeletion_ReturnsNotFound()
  {
    // Arrange
    var idToDelete = 7;
    var user = new Person
    {
      Id = 99,
      FirstName = "Test",
      LastName = "User",
      Role = 1,
      Email = "testuser@example.com",
      Password = "Password123!",
      Biography = "Test biography",
      Department = 2,
      DateOfBirth = DateOnly.Parse("1980-01-01")
    };

    _authService.GetMostRecentUserAsync().Returns(Task.FromResult<Person?>(user));
    _personService.DeleteAsync(idToDelete, user.Id).Returns(Task.FromResult(false));

    // Act
    var result = await _controller.DeletePerson(idToDelete);

    // Assert
    Assert.IsType<NotFoundResult>(result);
  }
}