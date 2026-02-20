using CloudInvoiceApp.Backend.Models;

namespace CloudInvoiceApp.Backend.Services;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
