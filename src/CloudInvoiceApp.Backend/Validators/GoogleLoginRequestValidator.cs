using CloudInvoiceApp.Backend.Requests;
using FastEndpoints;
using FluentValidation;

namespace CloudInvoiceApp.Backend.Validators;

public class GoogleLoginRequestValidator : Validator<GoogleLoginRequest>
{
    public GoogleLoginRequestValidator()
    {
        RuleFor(x => x.Credential)
            .NotEmpty().WithMessage("Credential is required.")
            .MaximumLength(4096).WithMessage("Credential is too long.");
    }
}
