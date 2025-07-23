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

  [HttpGet("{id:int}")]
  public async Task<ActionResult<PersonViewModel>> GetById(int id)
  {
    var person = await personService.GetByIdAsync(id);
    if (person == null) return NotFound();

    return Ok(MapToViewModel(person));
  }

  [HttpPost]
  public async Task<ActionResult> AddPerson([FromBody] PersonViewModel person)
  {
    if (person.Id > 0) return BadRequest("New person must not have an ID.");

    var newPerson = await personService.AddAsync(MapToDomainModel(person));
    if (newPerson == null) return BadRequest("Email must be unique.");

    return CreatedAtAction(nameof(GetById), new { id = person.Id }, person);
  }

  [HttpPut("{id:int}")]
  public async Task<ActionResult> UpdatePerson(int id, [FromBody] PersonViewModel person)
  {
    if (id <= 0 || id != person.Id)
      return BadRequest("ID in URL and payload must match and be greater than 0.");

    var updated = await personService.UpdateAsync(id, MapToDomainModel(person));
    if (!updated) return NotFound();

    return NoContent();
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
    Department = p.Department,
    DateOfBirth = p.DateOfBirth
  };

  private static Person MapToDomainModel(PersonViewModel vm) => new()
  {
    Id = vm.Id,
    FirstName = vm.FirstName,
    LastName = vm.LastName,
    Email = vm.Email,
    Role = vm.Role,
    Department = vm.Department,
    DateOfBirth = vm.DateOfBirth
  };
}