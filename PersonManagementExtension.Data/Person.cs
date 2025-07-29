namespace PersonManagementExtension.Data;

public class Person
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required int Role { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public string? Biography { get; set; }
    public int Department { get; set; }
    public DateOnly DateOfBirth { get; set; }
}