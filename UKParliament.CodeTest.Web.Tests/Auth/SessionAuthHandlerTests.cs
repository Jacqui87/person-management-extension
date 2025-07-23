namespace UKParliament.CodeTest.Web.Tests.Auth
{
    [TestFixture]
    public class SessionAuthHandlerTests
    {
        private PersonManagerContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<PersonManagerContext>()
                .UseInMemoryDatabase("TestDb_" + Guid.NewGuid())
                .Options;

            var context = new PersonManagerContext(options);

            // Seed People
            context.People.Add(new Person
            {
                Id = 1,
                FirstName = "TestUser",
                LastName = "User",
                Email = "test@example.com",
                Role = "user",
                Department = 1,
                DateOfBirth = new DateOnly(1990, 1, 1)
            });

            // Seed Sessions
            context.Sessions.Add(new Session
            {
                Token = "valid-token-123",
                UserId = 1
            });

            context.SaveChanges();

            return context;
        }

        private SessionAuthHandler CreateHandlerWithAuthorizationHeader(string? authorizationHeader)
        {
            var context = CreateDbContext();

            // Substitute for IOptionsMonitor<AuthenticationSchemeOptions>
            var optionsMonitor = Substitute.For<IOptionsMonitor<AuthenticationSchemeOptions>>();
            optionsMonitor.Get(Arg.Any<string>()).Returns(new AuthenticationSchemeOptions());

            var loggerFactory = Substitute.For<ILoggerFactory>();
            var urlEncoder = new UrlEncoder();

            var scheme = new AuthenticationScheme("Session", "Session", typeof(SessionAuthHandler));

            var httpContext = new DefaultHttpContext();
            if (authorizationHeader != null)
                httpContext.Request.Headers["Authorization"] = authorizationHeader;

            var authHandler = new TestableSessionAuthHandler(
                optionsMonitor,
                loggerFactory,
                urlEncoder,
                context)
            {
                Context = httpContext,
                Scheme = scheme
            };

            return authHandler;
        }

        [Test]
        public async Task HandleAuthenticateAsync_NoAuthorizationHeader_ReturnsNoResult()
        {
            var handler = CreateHandlerWithAuthorizationHeader(null);

            var result = await handler.HandleAuthenticateAsync();

            Assert.That(result, Is.EqualTo(AuthenticateResult.NoResult()).Using(new AuthenticateResultComparer()));
        }

        [Test]
        public async Task HandleAuthenticateAsync_InvalidAuthScheme_ReturnsNoResult()
        {
            var handler = CreateHandlerWithAuthorizationHeader("Basic xyz");

            var result = await handler.HandleAuthenticateAsync();

            Assert.That(result, Is.EqualTo(AuthenticateResult.NoResult()).Using(new AuthenticateResultComparer()));
        }

        [Test]
        public async Task HandleAuthenticateAsync_NonexistentToken_ReturnsFail()
        {
            var handler = CreateHandlerWithAuthorizationHeader("Bearer invalid-token");

            var result = await handler.HandleAuthenticateAsync();

            Assert.That(result.Failure, Is.Not.Null);
            Assert.That(result.Failure.Message, Is.EqualTo("Invalid or expired session"));
        }

        [Test]
        public async Task HandleAuthenticateAsync_UserNotFound_ReturnsFail()
        {
            var context = CreateDbContext();
            context.Sessions.Add(new Session { Token = "token-no-user", UserId = 9999 });
            await context.SaveChangesAsync();

            var optionsMonitor = Substitute.For<IOptionsMonitor<AuthenticationSchemeOptions>>();
            optionsMonitor.Get(Arg.Any<string>()).Returns(new AuthenticationSchemeOptions());

            var loggerFactory = Substitute.For<ILoggerFactory>();
            var urlEncoder = new UrlEncoder();

            var scheme = new AuthenticationScheme("Session", "Session", typeof(SessionAuthHandler));

            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = "Bearer token-no-user";

            var handler = new TestableSessionAuthHandler(
                optionsMonitor,
                loggerFactory,
                urlEncoder,
                context)
            {
                Context = httpContext,
                Scheme = scheme
            };

            var result = await handler.HandleAuthenticateAsync();

            Assert.That(result.Failure, Is.Not.Null);
            Assert.That(result.Failure.Message, Is.EqualTo("User not found"));
        }

        [Test]
        public async Task HandleAuthenticateAsync_ValidToken_ReturnsSuccessWithClaims()
        {
            var handler = CreateHandlerWithAuthorizationHeader("Bearer valid-token-123");

            var result = await handler.HandleAuthenticateAsync();

            Assert.That(result.Succeeded, Is.True);

            var claimsPrincipal = result.Principal;
            Assert.That(claimsPrincipal, Is.Not.Null);

            Assert.That(claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value, Is.EqualTo("1"));
            Assert.That(claimsPrincipal.FindFirst(ClaimTypes.Name)?.Value, Is.EqualTo("TestUser"));
            Assert.That(claimsPrincipal.FindFirst(ClaimTypes.Email)?.Value, Is.EqualTo("test@example.com"));
            Assert.That(claimsPrincipal.FindFirst(ClaimTypes.Role)?.Value, Is.EqualTo("user"));
        }

        // Helper Testable handler class exposing protected members
        private class TestableSessionAuthHandler : SessionAuthHandler
        {
            public TestableSessionAuthHandler(
                IOptionsMonitor<AuthenticationSchemeOptions> options,
                ILoggerFactory logger,
                UrlEncoder encoder,
                PersonManagerContext context)
                : base(options, logger, encoder, context)
            { }

            public new HttpContext Context
            {
                get => base.Context;
                set => base.Context = value;
            }

            public new Task<AuthenticateResult> HandleAuthenticateAsync() => base.HandleAuthenticateAsync();
        }

        // Custom comparer for AuthenticateResult equality check
        private class AuthenticateResultComparer : IEqualityComparer<AuthenticateResult>
        {
            public bool Equals(AuthenticateResult? x, AuthenticateResult? y)
            {
                if (x == null || y == null) return false;
                if (x.Succeeded && y.Succeeded) return true;
                if (x.Failure != null && y.Failure != null)
                    return x.Failure.Message == y.Failure.Message;
                if (x.None && y.None) return true;
                return false;
            }

            public int GetHashCode(AuthenticateResult obj)
            {
                return obj?.Failure?.Message?.GetHashCode() ?? 0;
            }
        }
    }
}