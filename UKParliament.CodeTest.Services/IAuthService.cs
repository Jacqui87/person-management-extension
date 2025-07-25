using UKParliament.CodeTest.Data;
using UKParliament.CodeTest.Services.Dtos;

namespace UKParliament.CodeTest.Services;

public interface IAuthService
{
  Task<List<Session>> GetAllSessionsAsync();
  Task<LoginCredentials?> LoginAsync(LoginRequest request);
  Task<LoginCredentials?> TokenLoginAsync(string token);
}