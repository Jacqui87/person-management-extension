namespace UKParliament.CodeTest.Services.Dtos;

public class LoginRequest
{
    public string? Email { get; set; } = "";
    public string? Password { get; set; } = "";
    public string? Token { get; set; } = "";
}