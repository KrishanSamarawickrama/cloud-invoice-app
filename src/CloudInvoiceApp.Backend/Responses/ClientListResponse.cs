namespace CloudInvoiceApp.Backend.Responses;

public class ClientListResponse
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Email { get; set; }
}
