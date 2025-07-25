using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UKParliament.CodeTest.Data;
using UKParliament.CodeTest.Services;
using UKParliament.CodeTest.Services.Dtos;

namespace UKParliament.CodeTest.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController(IAuthService authService) : ControllerBase
{
  [HttpGet("")]
  public async Task<ActionResult<List<Session>>> Get()
  {
    var session = await authService.GetAllSessionsAsync();

    return Ok(session);
  }

  [HttpPost("login")]
  public async Task<ActionResult<LoginCredentials?>> Login([FromBody] LoginRequest request)
  {
    try
    {
      var session = await authService.LoginAsync(request);
      return Ok(session ?? null);
    }
    catch (Exception)
    {
      // Log the exception
      return StatusCode(500, "Internal server error");
    }
  }
}