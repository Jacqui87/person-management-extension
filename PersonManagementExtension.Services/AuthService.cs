using PersonManagementExtension.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PersonManagementExtension.Services.Dtos;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace PersonManagementExtension.Services;

public interface IAuthService
{
  Task<List<Session>> GetAllSessionsAsync();
  Task<LoginCredentials?> LoginAsync(LoginRequest request);
}

public class AuthService(PersonManagerContext context, ILogger<AuthService> logger) : IAuthService
{
  public static string SecretKey = "your-256-bit-secret-your-256-bit-secret";

  public async Task<List<Session>> GetAllSessionsAsync()
  {
    try
    {
      return await context.Sessions.ToListAsync();
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Error retrieving all sessions.");
      return new List<Session>();
    }
  }

  public async Task<LoginCredentials?> LoginAsync(LoginRequest request)
  {
    if (!string.IsNullOrEmpty(request.Token))
    {
      return await TokenLoginAsync(request.Token);
    }

    var user = await context.People.FirstOrDefaultAsync(p =>
      p.Email == request.Email
      && p.Password == request.Password
      && (p.Role == 1 || p.Role == 2));
    if (user == null) return null;

    var jwtToken = GetJwtToken(user);
    var session = new Session { UserId = user.Id, Token = jwtToken, CreatedAt = DateTime.UtcNow };
    context.Sessions.Add(session);
    await context.SaveChangesAsync();

    return new LoginCredentials
    {
      User = user,
      Session = session
    };
  }

  #region Helpers

  internal async Task<LoginCredentials?> TokenLoginAsync(string token)
  {
    var userId = GetUserIdFromToken(token);
    var user = await context.People.FindAsync(userId);
    if (user == null) return null;

    var session = await context.Sessions.FirstOrDefaultAsync(s => s.Token == token);
    if (session == null) return null;

    return new LoginCredentials
    {
      User = user,
      Session = session
    };
  }

  internal int? GetUserIdFromToken(string token)
  {
    if (string.IsNullOrWhiteSpace(token)) return null;

    try
    {
      var handler = new JwtSecurityTokenHandler();
      var jwtToken = handler.ReadJwtToken(token);
      if (jwtToken == null) return null;

      var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
      if (userIdClaim == null) return null;

      if (int.TryParse(userIdClaim.Value, out var userId)) return userId;

      return null;
    }
    catch
    {
      return null;
    }
  }

  internal string GetJwtToken(Person user)
  {
    var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
    var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

    var claims = new List<Claim>
    {
      // Subject (user ID)
      new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
      // Email
      new Claim(JwtRegisteredClaimNames.Email, user.Email),
      // Name (full name or display name)
      new Claim(JwtRegisteredClaimNames.Name, $"{user.FirstName} {user.LastName}"),
      // Issued At (as unix timestamp, optional)
      new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
        ClaimValueTypes.Integer64),
      // Custom "role" claim; there is no standard "role" in JwtRegisteredClaimNames
      new Claim("role", user.Role.ToString())
    };

    var token = new JwtSecurityToken(
      issuer: "person_manager",
      audience: "people",
      claims: claims,
      expires: DateTime.UtcNow.AddHours(1),
      signingCredentials: credentials
    );

    try
    {
      var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
      return tokenString;
    }
    catch (Exception ex)
    {
      // Log ex.Message or throw further
      throw new InvalidOperationException("JWT token generation failed", ex);
    }
  }

  #endregion
}