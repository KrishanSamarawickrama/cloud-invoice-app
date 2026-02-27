using CloudInvoiceApp.Backend.Requests;
using FastEndpoints;
using FluentValidation;

namespace CloudInvoiceApp.Backend.Validators;

public class UpdateProfileRequestValidator : Validator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        When(x => x.DefaultFromAddress is not null, () =>
        {
            RuleFor(x => x.DefaultFromAddress!)
                .Must(x => x.Count <= 10).WithMessage("Default from address must not exceed 10 lines.");

            RuleForEach(x => x.DefaultFromAddress!)
                .MaximumLength(200).WithMessage("Each from address line must not exceed 200 characters.");
        });

        When(x => x.DefaultBankDetails is not null, () =>
        {
            RuleFor(x => x.DefaultBankDetails!.AccountHolder)
                .NotEmpty().MaximumLength(200);
            RuleFor(x => x.DefaultBankDetails!.BankName)
                .NotEmpty().MaximumLength(200);
            RuleFor(x => x.DefaultBankDetails!.AccountNumber)
                .NotEmpty().MaximumLength(50);
            RuleFor(x => x.DefaultBankDetails!.SwiftCode)
                .NotEmpty().MaximumLength(20);
        });
    }
}
