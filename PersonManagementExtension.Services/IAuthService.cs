using PersonManagementExtension.Data;
using PersonManagementExtension.Services.Dtos;

namespace PersonManagementExtension.Services;

public interface IAuthService
{
  Task<List<Session>> GetAllSessionsAsync();
  Task<LoginCredentials?> LoginAsync(LoginRequest request);
  Task<Person?> GetMostRecentUserAsync();
}