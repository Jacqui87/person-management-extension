using FluentValidation;

namespace PersonManagementExtension.Web.ViewModels;

public class PersonViewModelValidator : AbstractValidator<PersonViewModel>
{
    public PersonViewModelValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(50);

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(50);

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Role is required.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.");

        RuleFor(x => x.Department)
            .NotEmpty().WithMessage("Department is required.");

        RuleFor(x => x.DateOfBirth)
            .NotEmpty().WithMessage("Date of birth is required.");
    }
}