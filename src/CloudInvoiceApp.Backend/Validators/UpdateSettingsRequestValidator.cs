using CloudInvoiceApp.Backend.Requests;
using FastEndpoints;
using FluentValidation;

namespace CloudInvoiceApp.Backend.Validators;

public class UpdateSettingsRequestValidator : Validator<UpdateSettingsRequest>
{
    public UpdateSettingsRequestValidator()
    {
        RuleFor(x => x.InvoiceNumberPrefix)
            .NotEmpty().WithMessage("Invoice number prefix is required.")
            .Length(1, 10).WithMessage("Invoice number prefix must be 1–10 characters.")
            .Matches("^[A-Za-z0-9]+$").WithMessage("Invoice number prefix must be alphanumeric (letters and digits only).");
    }
}
