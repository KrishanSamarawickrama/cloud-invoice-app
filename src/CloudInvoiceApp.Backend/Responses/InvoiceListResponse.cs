namespace CloudInvoiceApp.Backend.Responses;

public class InvoiceListResponse
{
    public int Id { get; set; }
    public string? FileName { get; set; }
    public required string InvoiceNumber { get; set; } = "00-000013";
    public required string InvoiceDate { get; set; }
    public double Amount { get; set; }
}