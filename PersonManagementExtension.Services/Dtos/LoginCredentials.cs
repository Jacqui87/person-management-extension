using PersonManagementExtension.Data;

namespace PersonManagementExtension.Services.Dtos;

public class LoginCredentials
{
  public Session? Session { get; set; }
  public required Person? User { get; set; }
}