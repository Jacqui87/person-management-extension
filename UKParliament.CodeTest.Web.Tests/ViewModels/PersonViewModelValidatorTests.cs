using FluentValidation.TestHelper;
using UKParliament.CodeTest.Web.ViewModels;

namespace UKParliament.CodeTest.Web.Tests.ViewModels;

public class PersonViewModelValidatorTests
{
  private readonly PersonViewModelValidator _validator = new();

  private PersonViewModel ValidModel() => new()
  {
    FirstName = "Jane",
    LastName = "Doe",
    Role = 2,
    Email = "jane.doe@parliament.uk",
    Department = 1,
    DateOfBirth = new DateOnly(1990, 1, 1),   // <-- Use DateOnly here
    Password = "Secret123!"                   // <-- Required property added
  };

  [Fact]
  public void Should_Pass_For_Valid_Model()
  {
    var result = _validator.TestValidate(ValidModel());
    result.ShouldNotHaveAnyValidationErrors();
  }

  [Fact]
  public void Should_Have_Error_When_FirstName_Is_Empty()
  {
    var model = ValidModel();
    model.FirstName = "";
    var result = _validator.TestValidate(model);
    result.ShouldHaveValidationErrorFor(x => x.FirstName);
  }

  [Fact]
  public void Should_Have_Error_When_LastName_Is_Empty()
  {
    var model = ValidModel();
    model.LastName = "";
    var result = _validator.TestValidate(model);
    result.ShouldHaveValidationErrorFor(x => x.LastName);
  }

  [Fact]
  public void Should_Have_Error_When_Email_Is_Invalid()
  {
    var model = ValidModel();
    model.Email = "invalid-email";
    var result = _validator.TestValidate(model);
    result.ShouldHaveValidationErrorFor(x => x.Email);
  }

  [Fact]
  public void Should_Have_Error_When_Email_Is_Empty()
  {
    var model = ValidModel();
    model.Email = "";
    var result = _validator.TestValidate(model);
    result.ShouldHaveValidationErrorFor(x => x.Email);
  }

  [Fact]
  public void Should_Have_Error_When_Department_Is_Default()
  {
    var model = ValidModel();
    model.Department = 0;
    var result = _validator.TestValidate(model);
    result.ShouldHaveValidationErrorFor(x => x.Department);
  }

  [Fact]
  public void Should_Have_Error_When_FirstName_Too_Long()
  {
    var model = ValidModel();
    model.FirstName = new string('X', 51);
    var result = _validator.TestValidate(model);
    result.ShouldHaveValidationErrorFor(x => x.FirstName);
  }

  [Fact]
  public void Should_Have_Error_When_LastName_Too_Long()
  {
    var model = ValidModel();
    model.LastName = new string('X', 51);
    var result = _validator.TestValidate(model);
    result.ShouldHaveValidationErrorFor(x => x.LastName);
  }
}