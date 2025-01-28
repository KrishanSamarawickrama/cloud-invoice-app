namespace CloudInvoiceApp.Backend.Requests;

public class UpdateInvoiceRequest
{
    public int Id { get; set; }
    public string? FileName { get; set; }
    public required string InvoiceNumber { get; set; } = "00-000013";
    public required string InvoiceDate { get; set; } = DateTime.Now.ToString("MMMM dd, yyyy"); //January 24, 2024
    public required List<string> From { get; set; }
    public required List<string> To { get; set; }
    public required BankDetails BankDetails { get; set; }
    public required List<Service> Services { get; set; }
}