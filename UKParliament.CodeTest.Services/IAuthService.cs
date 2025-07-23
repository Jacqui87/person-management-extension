using UKParliament.CodeTest.Data;

namespace UKParliament.CodeTest.Services;

public interface IAuthService
{
    Task<LoginCredentials?> LoginAsync(LoginRequest request);
    Task<List<Session>> GetAllSessionsAsync();
}