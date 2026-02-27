namespace CloudInvoiceApp.Backend.Requests;

public sealed record UpdateInvoiceRequest
{
    public int Id { get; set; }
    public string? FileName { get; set; }
    public required string InvoiceNumber { get; set; }
    public required DateOnly InvoiceDate { get; set; }
    public required List<string> From { get; set; }
    public required List<string> To { get; set; }
    public required BankDetails BankDetails { get; set; }
    public required List<Service> Services { get; set; }
}