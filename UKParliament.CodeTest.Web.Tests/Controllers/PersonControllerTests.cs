namespace UKParliament.CodeTest.Web.Tests.Controllers
{
    [TestFixture]
    public class PersonControllerTests
    {
        private IPersonService _service = null!;
        private PersonController _controller = null!;

        [SetUp]
        public void Setup()
        {
            _service = Substitute.For<IPersonService>();
            _controller = new PersonController(_service);
        }

        [Test]
        public async Task Get_ReturnsOkWithMappedPeople()
        {
            var people = new List<Person>
            {
                new Person { Id = 1, FirstName = "Alice", LastName = "Smith", Email = "alice@example.com", Role = "user", Department = 1, DateOfBirth = new DateOnly(1990,1,1)},
                new Person { Id = 2, FirstName = "Bob", LastName = "Jones", Email = "bob@example.com", Role = "admin", Department = 2, DateOfBirth = new DateOnly(1985,5,15)}
            };
            _service.GetAllAsync().Returns(people);

            var result = await _controller.Get();

            Assert.IsInstanceOf<OkObjectResult>(result.Result);
            var okResult = result.Result as OkObjectResult;
            Assert.IsInstanceOf<IEnumerable<PersonViewModel>>(okResult?.Value);
            var vmList = okResult!.Value as IEnumerable<PersonViewModel>;
            vmList.Should().HaveCount(2);
            vmList.First().FirstName.Should().Be("Alice");
        }

        [Test]
        public async Task GetDepartments_ReturnsOkWithMappedDepartments()
        {
            var departments = new List<Department>
            {
                new Department { Id = 1, Name = "Sales"},
                new Department { Id = 2, Name = "Finance"}
            };
            _service.GetAllDepartmentsAsync().Returns(departments);

            var result = await _controller.GetDepartments();

            Assert.IsInstanceOf<OkObjectResult>(result.Result);
            var okResult = result.Result as OkObjectResult;
            Assert.IsInstanceOf<DepartmentViewModel[]>(okResult?.Value);
            var vmArray = okResult!.Value as DepartmentViewModel[];
            vmArray.Should().HaveCount(2);
            vmArray[0].Name.Should().Be("Sales");
        }

        [Test]
        public async Task GetById_ExistingId_ReturnsOkWithPersonViewModel()
        {
            var person = new Person { Id = 1, FirstName = "Alice", LastName = "Smith", Email = "alice@example.com", Role = "user", Department = 1, DateOfBirth = new DateOnly(1990, 1, 1)};
            _service.GetByIdAsync(1).Returns(person);

            var result = await _controller.GetById(1);

            Assert.IsInstanceOf<OkObjectResult>(result.Result);
            var okResult = result.Result as OkObjectResult;
            Assert.IsInstanceOf<PersonViewModel>(okResult?.Value);
            var vm = okResult!.Value as PersonViewModel;
            vm.Id.Should().Be(1);
            vm.FirstName.Should().Be("Alice");
        }

        [Test]
        public async Task GetById_NonExistingId_ReturnsNotFound()
        {
            _service.GetByIdAsync(999).Returns((Person?)null);

            var result = await _controller.GetById(999);

            Assert.IsInstanceOf<NotFoundResult>(result.Result);
        }

        [Test]
        public async Task AddPerson_IdGreaterThanZero_ReturnsBadRequest()
        {
            var vm = new PersonViewModel { Id = 5, FirstName = "New", LastName = "Person", Email = "new@example.com", Role = "user", Department = 1, DateOfBirth = new DateOnly(2000, 1, 1)};

            var result = await _controller.AddPerson(vm);

            Assert.IsInstanceOf<BadRequestObjectResult>(result);
            var badRequest = result as BadRequestObjectResult;
            Assert.AreEqual("New person must not have an ID.", badRequest!.Value);
        }

        [Test]
        public async Task AddPerson_ValidPerson_ReturnsCreatedAtAction()
        {
            var vm = new PersonViewModel { Id = 0, FirstName = "New", LastName = "Person", Email = "new@example.com", Role = "user", Department = 1, DateOfBirth = new DateOnly(2000, 1, 1)};

            // Setup AddAsync to assign Id simulating DB insert
            _service.AddAsync(Arg.Any<Person>()).Returns(callInfo =>
            {
                var person = callInfo.Arg<Person>();
                person.Id = 10;
                return Task.FromResult(person);
            });

            var result = await _controller.AddPerson(vm);

            Assert.IsInstanceOf<CreatedAtActionResult>(result);
            var createdResult = result as CreatedAtActionResult;
            Assert.AreEqual(nameof(PersonController.GetById), createdResult!.ActionName);
            var returnVm = createdResult.Value as PersonViewModel;
            returnVm!.Id.Should().Be(10);
        }

        [TestCase(0, 1)]   // id <= 0
        [TestCase(2, 1)]   // id != person.Id
        public async Task UpdatePerson_InvalidId_ReturnsBadRequest(int id, int vmId)
        {
            var vm = new PersonViewModel { Id = vmId, FirstName = "Updated", LastName = "Person", Email = "update@example.com", Role = "user", Department = 1, DateOfBirth = new DateOnly(1995, 1, 1) };

            var result = await _controller.UpdatePerson(id, vm);

            Assert.IsInstanceOf<BadRequestObjectResult>(result);
            var badRequest = result as BadRequestObjectResult;
            Assert.AreEqual("ID in URL and payload must match and be greater than 0.", badRequest!.Value);
        }

        [Test]
        public async Task UpdatePerson_NotFound_ReturnsNotFound()
        {
            var vm = new PersonViewModel { Id = 1, FirstName = "Updated", LastName = "Person", Email = "update@example.com", Role = "user", Department = 1, DateOfBirth= new DateOnly(1995, 1, 1) };
            _service.UpdateAsync(1, Arg.Any<Person>()).Returns(false);

            var result = await _controller.UpdatePerson(1, vm);

            Assert.IsInstanceOf<NotFoundResult>(result);
        }

        [Test]
        public async Task UpdatePerson_Success_ReturnsNoContent()
        {
            var vm = new PersonViewModel { Id = 1, FirstName = "Updated", LastName = "Person", Email = "update@example.com", Role = "user", Department = 1, DateOfBirth = new DateOnly(1995, 1, 1) };
            _service.UpdateAsync(1, Arg.Any<Person>()).Returns(true);

            var result = await _controller.UpdatePerson(1, vm);

            Assert.IsInstanceOf<NoContentResult>(result);
        }

        [Test]
        public async Task DeletePerson_Always_ReturnsNoContent()
        {
            _service.DeleteAsync(5).Returns(true);

            var result = await _controller.DeletePerson(5);

            Assert.IsInstanceOf<NoContentResult>(result);
        }
    }
}