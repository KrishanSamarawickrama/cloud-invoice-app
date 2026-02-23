namespace CloudInvoiceApp.Backend.Requests;

public sealed record UpdateClientRequest
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Email { get; set; }
    public required List<string> Address { get; set; }
}
