namespace CloudInvoiceApp.Backend.Responses;

public sealed class ClientResponse
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Email { get; set; }
    public required List<string> Address { get; set; }
    public DateTime CreatedDate { get; set; }
}
