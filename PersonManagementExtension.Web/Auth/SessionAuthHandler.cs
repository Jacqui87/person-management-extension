using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using PersonManagementExtension.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Text.Encodings.Web;

namespace PersonManagementExtension.Web.Auth;

public class SessionAuthHandler(
  IOptionsMonitor<AuthenticationSchemeOptions> options,
  ILoggerFactory logger,
  UrlEncoder encoder,
  PersonManagerContext context) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
  protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
  {
    if (!Request.Headers.TryGetValue("Authorization", out var authHeader) ||
        !authHeader.ToString().StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
      return AuthenticateResult.NoResult();

    var token = authHeader.ToString().Substring("Bearer ".Length).Trim();

    // Find the session by token string, not by Id
    var session = await context.Sessions.FirstOrDefaultAsync(s => s.Token == token);
    if (session == null) return AuthenticateResult.Fail("Invalid or expired session");

    var user = await context.People.FirstOrDefaultAsync(p => p.Id == session.UserId);
    if (user == null) return AuthenticateResult.Fail("User not found");

    var claims = new List<Claim>
    {
      new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
      new Claim(ClaimTypes.Email, user.Email),
      new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
      new Claim(ClaimTypes.Role, user.Role.ToString())
    };

    var identity = new ClaimsIdentity(claims, Scheme.Name);
    var principal = new ClaimsPrincipal(identity);
    var ticket = new AuthenticationTicket(principal, Scheme.Name);

    return AuthenticateResult.Success(ticket);
  }
}