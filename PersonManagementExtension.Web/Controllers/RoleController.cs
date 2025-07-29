using Microsoft.AspNetCore.Mvc;
using PersonManagementExtension.Web.ViewModels;
using PersonManagementExtension.Services;
using Microsoft.AspNetCore.Authorization;

namespace PersonManagementExtension.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoleController(IRoleService service) : ControllerBase
{
  [HttpGet]
  public async Task<ActionResult<RoleViewModel[]>> Get()
  {
    var roles = await service.GetAllAsync();

    return Ok(roles.Select(d => new RoleViewModel
    {
      Id = d.Id,
      Type = d.Type
    }).ToArray());
  }
}