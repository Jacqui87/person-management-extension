using Microsoft.EntityFrameworkCore;

namespace PersonManagementExtension.Data;

public class PersonManagerContext(DbContextOptions<PersonManagerContext> options) : DbContext(options)
{
  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Session>().HasData();

    modelBuilder.Entity<Department>().HasData(
      new Department { Id = 1, Name = "Sales" },
      new Department { Id = 2, Name = "Marketing" },
      new Department { Id = 3, Name = "Finance" },
      new Department { Id = 4, Name = "HR" });

    modelBuilder.Entity<Role>().HasData(
      new Role { Id = 1, Type = "User" },
      new Role { Id = 2, Type = "Admin" });

    modelBuilder.Entity<Person>().HasData(
      new Person
      {
        Id = 1,
        FirstName = "Alice",
        LastName = "Smith",
        Role = 1,
        Email = "alice.smith@test.net",
        Department = 1,
        Password = "Password1!",
        CultureCode = "",
        DateOfBirth = new DateOnly(1980, 10, 25),
        Biography = "Trail running, world cuisines, community projects"
      },
      new Person
      {
        Id = 2,
        FirstName = "Robert",
        LastName = "Jones",
        Role = 1,
        Email = "robert.jones@test.net",
        Department = 2,
        CultureCode = "cy-GB",
        Password = "SecurePass2@",
        DateOfBirth = new DateOnly(1987, 3, 1),
        Biography = "Photography, urban gardening, local arts & music"
      },
      new Person
      {
        Id = 3,
        FirstName = "Amy",
        LastName = "Johnson",
        Role = 2,
        Email = "amy.johnson@test.net",
        Department = 3,
        CultureCode = "en-GB",
        Password = "AdminPass3#",
        DateOfBirth = new DateOnly(1990, 5, 15),
        Biography = "Board games, travel, trivia nights"
      },
      new Person
      {
        Id = 4,
        FirstName = "John",
        LastName = "Doe",
        Role = 1,
        Email = "john.doe@test.net",
        Department = 4,
        CultureCode = "en-GB",
        Password = "UserPass4$",
        DateOfBirth = new DateOnly(1985, 8, 20),
        Biography = "Long-distance cycling, creative writing, community clean-ups"
      },
      new Person
      {
        Id = 5,
        FirstName = "Emily",
        LastName = "Williams",
        Role = 2,
        Email = "emily.williams@test.net",
        Department = 2,
        CultureCode = "cy-GB",
        Password = "EmilyPwd5%",
        DateOfBirth = new DateOnly(1992, 11, 10),
        Biography = "Hiking, cooking, volunteering"
      });
  }

  public DbSet<Person> People { get; set; } = null!;
  public DbSet<Department> Departments { get; set; } = null!;
  public  DbSet<Session> Sessions { get; set; } = null!;
  public DbSet<Role> Roles { get; set; } = null!;
}