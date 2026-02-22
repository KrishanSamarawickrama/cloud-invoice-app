namespace CloudInvoiceApp.Backend.Requests;

public class CreateClientRequest
{
    public required string Name { get; set; }
    public string? Email { get; set; }
    public required List<string> Address { get; set; }
}
