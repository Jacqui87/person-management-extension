using UKParliament.CodeTest.Data;

namespace UKParliament.CodeTest.Services.Dtos;

public class LoginCredentials
{
  public Session? Session { get; set; }
  public required Person? User { get; set; }
}