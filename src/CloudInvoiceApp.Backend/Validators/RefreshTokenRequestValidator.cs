using CloudInvoiceApp.Backend.Requests;
using FastEndpoints;
using FluentValidation;

namespace CloudInvoiceApp.Backend.Validators;

public class RefreshTokenRequestValidator : Validator<RefreshTokenRequest>
{
    public RefreshTokenRequestValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required.")
            .MaximumLength(512).WithMessage("Refresh token is too long.");
    }
}
