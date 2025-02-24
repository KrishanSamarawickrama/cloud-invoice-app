namespace CloudInvoiceApp.Backend.Requests;

public class CreateInvoiceRequest
{
    public string? FileName { get; set; }
    public required string InvoiceNumber { get; set; } = " 00-000013";
    public required DateOnly InvoiceDate { get; set; }
    public required List<string> From { get; set; }
    public required List<string> To { get; set; }
    public required BankDetails BankDetails { get; set; }
    public required List<Service> Services { get; set; }
}

public class BankDetails
{
    public required string AccountHolder { get; set; }
    public required string BankName { get; set; }
    public required string AccountNumber { get; set; }
    public required string SwiftCode { get; set; }
}

public class Service
{
    public required string ServiceName { get; set; }
    public double Amount { get; set; }
}