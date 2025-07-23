namespace UKParliament.CodeTest.Web.Tests.Controllers
{
    [TestFixture]
    public class AuthControllerTests
    {
        private IAuthService _authService = null!;
        private AuthController _controller = null!;

        [SetUp]
        public void Setup()
        {
            _authService = Substitute.For<IAuthService>();
            _controller = new AuthController(_authService);
        }

        [Test]
        public async Task Get_ReturnsOkResult_WithListOfSessions()
        {
            var fakeSessions = new List<Session>
            {
                new Session { Id = Guid.NewGuid(), UserId = 1, Token = "token1" },
                new Session { Id = Guid.NewGuid(), UserId = 2, Token = "token2" }
            };
            _authService.GetAllSessionsAsync().Returns(Task.FromResult((IReadOnlyList<Session>)fakeSessions));

            var result = await _controller.Get();

            Assert.IsInstanceOf<OkObjectResult>(result.Result);
            var okResult = result.Result as OkObjectResult;
            Assert.IsAssignableFrom<List<Session>>(okResult?.Value);
            var returnValue = okResult!.Value as List<Session>;
            returnValue.Should().BeEquivalentTo(fakeSessions);
        }

        [Test]
        public async Task Login_ValidUser_ReturnsOkWithLoginCredentials()
        {
            var request = new LoginRequest { FirstName = "Alice", Email = "alice@example.com" };
            var loginCredentials = new LoginCredentials
            {
                Session = new Session { Id = Guid.NewGuid(), UserId = 1, Token = "token" },
                User = new Person { Id = 1, FirstName = "Alice", Email = "alice@example.com" }
            };

            _authService.LoginAsync(request).Returns(Task.FromResult<LoginCredentials?>(loginCredentials));

            var result = await _controller.Login(request);

            Assert.IsInstanceOf<OkObjectResult>(result.Result);
            var okResult = result.Result as OkObjectResult;
            Assert.IsAssignableFrom<LoginCredentials>(okResult?.Value);
            var returnValue = okResult!.Value as LoginCredentials;
            returnValue.Should().BeEquivalentTo(loginCredentials);
        }

        [Test]
        public async Task Login_InvalidUser_ReturnsUnauthorized()
        {
            var request = new LoginRequest { FirstName = "Invalid", Email = "invalid@example.com" };
            _authService.LoginAsync(request).Returns(Task.FromResult<LoginCredentials?>(null));

            var result = await _controller.Login(request);

            Assert.IsInstanceOf<UnauthorizedObjectResult>(result.Result);
            var unauthorizedResult = result.Result as UnauthorizedObjectResult;
            Assert.AreEqual("Invalid username or password.", unauthorizedResult?.Value);
        }

        [Test]
        public async Task Login_ServiceThrowsException_ReturnsInternalServerError()
        {
            var request = new LoginRequest { FirstName = "Error", Email = "error@example.com" };
            _authService
                .When(x => x.LoginAsync(request))
                .Do(x => { throw new Exception("Database failure"); });

            var result = await _controller.Login(request);

            Assert.IsInstanceOf<ObjectResult>(result.Result);
            var objectResult = result.Result as ObjectResult;
            Assert.AreEqual(500, objectResult?.StatusCode);
            Assert.AreEqual("Internal server error", objectResult?.Value);
        }
    }
}