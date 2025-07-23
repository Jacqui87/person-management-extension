namespace UKParliament.CodeTest.Services.Tests
{
    [TestFixture]
    public class AuthServiceTests : IDisposable
    {
        private PersonManagerContext _context = null!;
        private AuthService _authService = null!;
        private ILogger<AuthService> _logger = null!;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<PersonManagerContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()) // unique DB per test suite instance
                .Options;

            _context = new PersonManagerContext(options);

            // Seed test people
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
                    DateOfBirth = new DateOnly(1985, 5, 23)
                }
            );
            _context.SaveChanges();

            _logger = Substitute.For<ILogger<AuthService>>();
            _authService = new AuthService(_context, _logger);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Dispose();
        }

        [Test]
        public async Task LoginAsync_WithValidUser_ReturnsLoginCredentialsAndCreatesSession()
        {
            var request = new LoginRequest { FirstName = "Alice", Email = "alice@example.com" };

            var result = await _authService.LoginAsync(request);

            result.Should().NotBeNull();
            result!.User.FirstName.Should().Be("Alice");
            result.Session.Should().NotBeNull();
            result.Session.UserId.Should().Be(result.User.Id);
            Guid.TryParse(result.Session.Token, out _).Should().BeTrue();

            var sessions = await _context.Sessions.ToListAsync();
            sessions.Should().ContainSingle(s => s.UserId == result.User.Id);
        }

        [Test]
        public async Task LoginAsync_WithInvalidUser_ReturnsNull()
        {
            var request = new LoginRequest { FirstName = "NonExistent", Email = "noemail@example.com" };

            var result = await _authService.LoginAsync(request);

            result.Should().BeNull();

            var sessionsCount = await _context.Sessions.CountAsync();
            sessionsCount.Should().Be(0);
        }

        [Test]
        public async Task GetAllSessionsAsync_ReturnsAllSessions()
        {
            _context.Sessions.AddRange(
                new Session { UserId = 1, Token = Guid.NewGuid().ToString() },
                new Session { UserId = 2, Token = Guid.NewGuid().ToString() }
            );
            await _context.SaveChangesAsync();

            var sessions = await _authService.GetAllSessionsAsync();

            sessions.Should().HaveCount(2);
            sessions.Select(s => s.UserId).Should().Contain(new[] { 1, 2 });
        }
    }
}