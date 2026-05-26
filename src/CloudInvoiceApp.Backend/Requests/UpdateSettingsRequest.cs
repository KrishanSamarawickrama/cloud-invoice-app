namespace CloudInvoiceApp.Backend.Requests;

public sealed record UpdateSettingsRequest
{
    public required string InvoiceNumberPrefix { get; set; }
}
