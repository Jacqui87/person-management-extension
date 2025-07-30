namespace PersonManagementExtension.Web.ViewModels;

public class PersonViewModel
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required int Role { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public int Department { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public string? CultureCode { get; set; }
    public string? Biography { get; set; }
}