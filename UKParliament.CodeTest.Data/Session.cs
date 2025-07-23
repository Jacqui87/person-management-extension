namespace UKParliament.CodeTest.Data;

public class Session
{
    public Guid Id { get; set; } = Guid.NewGuid(); // Primary key

    public int UserId { get; set; }

    public string Token { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}