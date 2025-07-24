using UKParliament.CodeTest.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace UKParliament.CodeTest.Services;

public class LoginCredentials
{
    public Session? Session { get; set; }
    public required Person User { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public class AuthService(PersonManagerContext context, ILogger<AuthService> logger) : IAuthService
{
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
        var user = await context.People
            .FirstOrDefaultAsync(p => p.Email == request.Email && p.Password == request.Password);

        if (user == null) return null;

        var session = new Session { UserId = user.Id, Token = Guid.NewGuid().ToString() };
        context.Sessions.Add(session);
        await context.SaveChangesAsync();

        return new LoginCredentials
        {
            Session = session,
            User = new Person
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                Password = user.Password,
                Department = user.Department,
                DateOfBirth = user.DateOfBirth,
                Biography = user.Biography
            }
        };
    }
}