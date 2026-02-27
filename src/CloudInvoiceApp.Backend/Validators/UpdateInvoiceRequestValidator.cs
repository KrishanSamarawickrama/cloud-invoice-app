using CloudInvoiceApp.Backend.Requests;
using FastEndpoints;
using FluentValidation;

namespace CloudInvoiceApp.Backend.Validators;

public class UpdateInvoiceRequestValidator : Validator<UpdateInvoiceRequest>
{
    public UpdateInvoiceRequestValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Invalid invoice ID.");

        RuleFor(x => x.InvoiceNumber)
            .NotEmpty().WithMessage("Invoice number is required.")
            .MaximumLength(50).WithMessage("Invoice number must not exceed 50 characters.");

        RuleFor(x => x.InvoiceDate)
            .NotEmpty().WithMessage("Invoice date is required.");

        RuleFor(x => x.FileName)
            .MaximumLength(255).WithMessage("File name must not exceed 255 characters.");

        RuleFor(x => x.From)
            .NotEmpty().WithMessage("From address is required.")
            .Must(x => x.Count <= 10).WithMessage("From address must not exceed 10 lines.");

        RuleForEach(x => x.From)
            .MaximumLength(200).WithMessage("Each From line must not exceed 200 characters.");

        RuleFor(x => x.To)
            .NotEmpty().WithMessage("To address is required.")
            .Must(x => x.Count <= 10).WithMessage("To address must not exceed 10 lines.");

        RuleForEach(x => x.To)
            .MaximumLength(200).WithMessage("Each To line must not exceed 200 characters.");

        RuleFor(x => x.BankDetails)
            .NotNull().WithMessage("Bank details are required.");

        When(x => x.BankDetails is not null, () =>
        {
            RuleFor(x => x.BankDetails.AccountHolder)
                .NotEmpty().MaximumLength(200);
            RuleFor(x => x.BankDetails.BankName)
                .NotEmpty().MaximumLength(200);
            RuleFor(x => x.BankDetails.AccountNumber)
                .NotEmpty().MaximumLength(50);
            RuleFor(x => x.BankDetails.SwiftCode)
                .NotEmpty().MaximumLength(20);
        });

        RuleFor(x => x.Services)
            .NotEmpty().WithMessage("At least one service is required.")
            .Must(x => x.Count <= 50).WithMessage("Cannot exceed 50 services.");

        RuleForEach(x => x.Services).ChildRules(service =>
        {
            service.RuleFor(s => s.ServiceName)
                .NotEmpty().MaximumLength(500);
            service.RuleFor(s => s.Amount)
                .GreaterThan(0).LessThanOrEqualTo(100_000_000);
        });
    }
}
