using Microsoft.AspNetCore.Mvc;
using PersonManagementExtension.Data;
using PersonManagementExtension.Web.ViewModels;
using PersonManagementExtension.Services;
using Microsoft.AspNetCore.Authorization;
using StatusCodes = PersonManagementExtension.Services.Dtos.StatusCodes;

namespace PersonManagementExtension.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PersonController(IAuthService authService, IPersonService service) : ControllerBase
{
  [HttpGet]
  public async Task<ActionResult<PersonViewModel[]>> Get()
  {
    var people = await service.GetAllAsync();

    // Returning an empty array with 200 OK is preferred REST behavior
    return Ok(people.Select(MapToViewModel));
  }

  [HttpGet("{id:int}")]
  public async Task<ActionResult<PersonViewModel>> GetById(int id)
  {
    var person = await service.GetByIdAsync(id);
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
    var newPerson = await service.AddAsync(MapToDomainModel(person));
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
    var updated = await service.UpdateAsync(id, MapToDomainModel(person));
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
    var user = await authService.GetMostRecentUserAsync();
    var deleted = await service.DeleteAsync(id, user?.Id);
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
    CultureCode = p.CultureCode,
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
    CultureCode = vm.CultureCode,
    Biography = vm.Biography
  };
}