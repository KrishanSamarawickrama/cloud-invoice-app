namespace CloudInvoiceApp.Backend.Responses;

public class AuthResponse
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public required UserInfo User { get; set; }
}

public class UserInfo
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string Name { get; set; }
    public string? PictureUrl { get; set; }
}
