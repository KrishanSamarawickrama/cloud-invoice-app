using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CloudInvoiceApp.Backend.Endpoints.Auth;

public class LogoutEndpoint(InvoiceDbContext dbContext) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Post("/api/auth/logout");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = User.GetUserId();
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user is not null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await dbContext.SaveChangesAsync(ct);
        }

        await SendOkAsync(new { Message = "Logged out successfully." }, ct);
    }
}
