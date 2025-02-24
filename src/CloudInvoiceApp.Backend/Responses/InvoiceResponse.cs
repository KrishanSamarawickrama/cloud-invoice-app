using CloudInvoiceApp.Backend.Requests;

namespace CloudInvoiceApp.Backend.Responses;

public sealed class InvoiceResponse
{
    public int Id { get; set; }
    public string? FileName { get; set; }
    public required string InvoiceNumber { get; set; } = "00-000013";
    public required string InvoiceDate { get; set; }
    public required List<string> From { get; set; }
    public required List<string> To { get; set; }
    public required BankDetails BankDetails { get; set; }
    public required List<Service> Services { get; set; }
}