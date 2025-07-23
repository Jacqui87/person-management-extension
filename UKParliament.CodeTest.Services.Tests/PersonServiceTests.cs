namespace UKParliament.CodeTest.Services.Tests
{
    [TestFixture]
    public class PersonServiceTests : IDisposable
    {
        private PersonManagerContext _context = null!;
        private PersonService _personService = null!;
        private ILogger<PersonService> _logger = null!;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<PersonManagerContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()) // unique DB per test
                .Options;
            _context = new PersonManagerContext(options);

            // Seed initial data
            _context.People.AddRange(
                new Person
                {
                    Id = 1,
                    FirstName = "Alice",
                    LastName = "Smith",
                    Email = "alice@example.com",
                    Role = "user",
                    Department = 1,
                    DateOfBirth = new DateOnly(1990, 1, 1)
                },
                new Person
                {
                    Id = 2,
                    FirstName = "Bob",
                    LastName = "Jones",
                    Email = "bob@example.com",
                    Role = "admin",
                    Department = 2,
                    DateOfBirth = new DateOnly(1985, 5, 15)
                });
            
            _context.Departments.AddRange(
                new Department { Id = 1, Name = "Sales" },
                new Department { Id = 2, Name = "Finance" });

            _context.SaveChanges();

            _logger = Substitute.For<ILogger<PersonService>>();
            _personService = new PersonService(_context, _logger);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Dispose();
        }

        [Test]
        public async Task GetAllAsync_ReturnsAllPeople()
        {
            var people = await _personService.GetAllAsync();

            people.Should().HaveCount(2);
            people.Should().Contain(p => p.FirstName == "Alice");
            people.Should().Contain(p => p.FirstName == "Bob");
        }

        [Test]
        public async Task GetAllDepartmentsAsync_ReturnsAllDepartments()
        {
            var departments = await _personService.GetAllDepartmentsAsync();

            departments.Should().HaveCount(2);
            departments.Should().Contain(d => d.Name == "Sales");
            departments.Should().Contain(d => d.Name == "Finance");
        }

        [Test]
        public async Task GetByIdAsync_WithExistingId_ReturnsPerson()
        {
            var person = await _personService.GetByIdAsync(1);

            person.Should().NotBeNull();
            person!.FirstName.Should().Be("Alice");
        }

        [Test]
        public async Task GetByIdAsync_WithNonExistingId_ReturnsNull()
        {
            var person = await _personService.GetByIdAsync(999);

            person.Should().BeNull();
        }

        [Test]
        public async Task AddAsync_AddsNewPerson()
        {
            var newPerson = new Person
            {
                FirstName = "Charlie",
                LastName = "Brown",
                Email = "charlie@example.com",
                Role = "user",
                Department = 1,
                DateOfBirth = new DateOnly(2000, 6, 15)
            };

            var addedPerson = await _personService.AddAsync(newPerson);

            addedPerson.Should().NotBeNull();
            addedPerson.Id.Should().BeGreaterThan(0);
            (await _context.People.CountAsync()).Should().Be(3);
        }

        [Test]
        public async Task UpdateAsync_ExistingPerson_UpdatesAndReturnsTrue()
        {
            var personToUpdate = new Person
            {
                Id = 1,
                FirstName = "Alicia",
                LastName = "Smith",
                Email = "alice@example.com",
                Role = "user",
                Department = 1,
                DateOfBirth = new DateOnly(1990, 1, 1)
            };

            var result = await _personService.UpdateAsync(1, personToUpdate);

            result.Should().BeTrue();

            var updatedPerson = await _context.People.FindAsync(1);
            updatedPerson!.FirstName.Should().Be("Alicia");
        }

        [Test]
        public async Task UpdateAsync_NonExistingPerson_ReturnsFalse()
        {
            var personToUpdate = new Person
            {
                Id = 999,
                FirstName = "Non",
                LastName = "Existent",
                Email = "noone@example.com",
                Role = "user",
                Department = 1,
                DateOfBirth = new DateOnly(1990, 1, 1)
            };

            var result = await _personService.UpdateAsync(999, personToUpdate);

            result.Should().BeFalse();
        }

        [Test]
        public async Task DeleteAsync_DeletesNonAdminPerson_ReturnsTrue()
        {
            var result = await _personService.DeleteAsync(1); // Alice is "user"

            result.Should().BeTrue();

            var exists = await _context.People.AnyAsync(p => p.Id == 1);
            exists.Should().BeFalse();
        }

        [Test]
        public async Task DeleteAsync_AttemptToDeleteAdmin_ReturnsFalseAndLogsWarning()
        {
            var result = await _personService.DeleteAsync(2); // Bob is "admin"

            result.Should().BeFalse();

            // Verify the warning log was called about admin deletion attempt
            _logger.Received(1).Log(
                LogLevel.Warning,
                Arg.Any<EventId>(),
                Arg.Is<It.IsAnyType>(v => v.ToString()!.Contains("Attempted to delete admin user")),
                null,
                Arg.Any<Func<It.IsAnyType, Exception?, string>>());
        }

        [Test]
        public async Task DeleteAsync_NonExistingPerson_ReturnsFalse()
        {
            var result = await _personService.DeleteAsync(999);

            result.Should().BeFalse();
        }
    }
}