using Microsoft.EntityFrameworkCore;

namespace UKParliament.CodeTest.Data;

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

    modelBuilder.Entity<Person>().HasData(
      new Person
      {
        Id = 1,
        FirstName = "Alice",
        LastName = "Smith",
        Role = "user",
        Email = "aa@aa.com",
        Department = 1,
        DateOfBirth = new DateOnly(1980, 10, 25)
      },
      new Person
      {
        Id = 2,
        FirstName = "Robert",
        LastName = "Jones",
        Role = "user",
        Email = "bb@bb.com",
        Department = 2,
        DateOfBirth = new DateOnly(1987, 3, 1)
      },
      new Person
      {
        Id = 3,
        FirstName = "Amy",
        LastName = "Johnson",
        Role = "admin",
        Email = "cc@cc.com",
        Department = 3,
        DateOfBirth = new DateOnly(1990, 5, 15)
      },
      new Person
      {
        Id = 4,
        FirstName = "John",
        LastName = "Doe",
        Role = "user",
        Email = "dd@dd.com",
        Department = 4,
        DateOfBirth = new DateOnly(1985, 8, 20)
      });
  }

  public required DbSet<Person> People { get; set; }

  public required DbSet<Department> Departments { get; set; }

  public required DbSet<Session> Sessions { get; set; }
}