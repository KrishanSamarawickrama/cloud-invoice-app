using CloudInvoiceApp.Backend.Requests;

namespace CloudInvoiceApp.Backend.Responses;

public sealed class ProfileResponse
{
    public required string Email { get; set; }
    public required string Name { get; set; }
    public string? PictureUrl { get; set; }
    public List<string>? DefaultFromAddress { get; set; }
    public BankDetails? DefaultBankDetails { get; set; }
}
