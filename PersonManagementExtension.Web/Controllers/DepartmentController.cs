using Microsoft.AspNetCore.Mvc;
using PersonManagementExtension.Web.ViewModels;
using PersonManagementExtension.Services;
using Microsoft.AspNetCore.Authorization;

namespace PersonManagementExtension.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DepartmentController(IDepartmentService service) : ControllerBase
{
  [HttpGet]
  public async Task<ActionResult<DepartmentViewModel[]>> Get()
  {
    var departments = await service.GetAllAsync();

    return Ok(departments.Select(d => new DepartmentViewModel
    {
      Id = d.Id,
      Name = d.Name
    }).ToArray());
  }
}