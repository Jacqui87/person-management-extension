using Microsoft.AspNetCore.Mvc;
using UKParliament.CodeTest.Data;
using UKParliament.CodeTest.Web.ViewModels;
using UKParliament.CodeTest.Services;
using Microsoft.AspNetCore.Authorization;

namespace UKParliament.CodeTest.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PersonController(IPersonService personService) : ControllerBase
{
  [HttpGet]
  public async Task<ActionResult<PersonViewModel[]>> Get()
  {
    var people = await personService.GetAllAsync();

    // Returning an empty array with 200 OK is preferred REST behavior
    return Ok(people.Select(MapToViewModel));
  }

  [HttpGet("departments")]
  public async Task<ActionResult<DepartmentViewModel[]>> GetDepartments()
  {
    var departments = await personService.GetAllDepartmentsAsync();

    // Returning an empty array with 200 OK is preferred REST behavior
    return Ok(departments.Select(d => new DepartmentViewModel
    {
      Id = d.Id,
      Name = d.Name
    }).ToArray());
  }

  [HttpGet("roles")]
  public async Task<ActionResult<RoleViewModel[]>> GetRoles()
  {
    var roles = await personService.GetAllRolesAsync();

    // Returning an empty array with 200 OK is preferred REST behavior
    return Ok(roles.Select(d => new RoleViewModel
    {
      Id = d.Id,
      Type = d.Type
    }).ToArray());
  }

  [HttpGet("{id:int}")]
  public async Task<ActionResult<PersonViewModel>> GetById(int id)
  {
    var person = await personService.GetByIdAsync(id);
    if (person == null) return NotFound();

    return Ok(MapToViewModel(person));
  }

  [HttpPost]
  [ProducesResponseType((int)StatusCodes.Forbidden)]
  [ProducesResponseType((int)StatusCodes.NotFound)]
  [ProducesResponseType((int)StatusCodes.NoContent)]
  [ProducesResponseType((int)StatusCodes.Unauthorised)]
  [ProducesResponseType((int)StatusCodes.Success, Type = typeof(ActionResult<Person?>))]
  [ProducesResponseType((int)StatusCodes.BadRequest)]
  [ProducesResponseType((int)StatusCodes.Error)]
  public async Task<ActionResult<Person?>> AddPerson([FromBody] PersonViewModel person)
  {
    var newPerson = await personService.AddAsync(MapToDomainModel(person));
    return newPerson.StatusCode switch
    {
      StatusCodes.Forbidden => StatusCode((int)StatusCodes.Forbidden),
      StatusCodes.NotFound => NotFound(),
      StatusCodes.NoContent => NoContent(),
      _ => Ok(newPerson.Data),
    };
  }

  [HttpPut("{id:int}")]
  [ProducesResponseType((int)StatusCodes.Forbidden)]
  [ProducesResponseType((int)StatusCodes.NotFound)]
  [ProducesResponseType((int)StatusCodes.NoContent)]
  [ProducesResponseType((int)StatusCodes.Unauthorised)]
  [ProducesResponseType((int)StatusCodes.Success, Type = typeof(bool))]
  [ProducesResponseType((int)StatusCodes.BadRequest)]
  [ProducesResponseType((int)StatusCodes.Error)]
  public async Task<ActionResult<bool>> UpdatePerson(int id, [FromBody] PersonViewModel person)
  {
    var updated = await personService.UpdateAsync(id, MapToDomainModel(person));
    return updated.StatusCode switch
    {
      StatusCodes.Forbidden => StatusCode((int)StatusCodes.Forbidden),
      StatusCodes.NotFound => NotFound(),
      StatusCodes.NoContent => NoContent(),
      _ => Ok(updated.Data),
    };
  }

  [HttpDelete("{id:int}")]
  public async Task<ActionResult> DeletePerson(int id)
  {
    var deleted = await personService.DeleteAsync(id);
    if (!deleted) return NotFound();

    return NoContent();
  }

  // Mapping Helpers
  private static PersonViewModel MapToViewModel(Person p) => new()
  {
    Id = p.Id,
    FirstName = p.FirstName,
    LastName = p.LastName,
    Email = p.Email,
    Role = p.Role,
    Password = p.Password,
    Department = p.Department,
    DateOfBirth = p.DateOfBirth,
    Biography = p.Biography
  };

  private static Person MapToDomainModel(PersonViewModel vm) => new()
  {
    Id = vm.Id,
    FirstName = vm.FirstName,
    LastName = vm.LastName,
    Email = vm.Email,
    Role = vm.Role,
    Password = vm.Password,
    Department = vm.Department,
    DateOfBirth = vm.DateOfBirth,
    Biography = vm.Biography
  };
}