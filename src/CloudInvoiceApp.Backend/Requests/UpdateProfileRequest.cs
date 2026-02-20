namespace CloudInvoiceApp.Backend.Requests;

public sealed record UpdateProfileRequest
{
    public List<string>? DefaultFromAddress { get; set; }
    public BankDetails? DefaultBankDetails { get; set; }
}
