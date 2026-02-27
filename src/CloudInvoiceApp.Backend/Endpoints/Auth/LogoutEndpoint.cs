using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CloudInvoiceApp.Backend.Endpoints.Auth;

public class LogoutEndpoint(InvoiceDbContext dbContext, IAuditService auditService, IWebHostEnvironment env) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Post("/api/auth/logout");
        Summary(s => s.Summary = "Logout and invalidate refresh token");
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

        CookieHelper.ClearRefreshTokenCookie(HttpContext, env.IsDevelopment());

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await auditService.LogAsync(userId, "LOGOUT", "User", userId, ipAddress: ipAddress);

        await Send.OkAsync(new { Message = "Logged out successfully." }, ct);
    }
}
