using CloudInvoiceApp.Backend.Configuration;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Responses;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CloudInvoiceApp.Backend.Endpoints.Auth;

public class RefreshTokenEndpoint(
    InvoiceDbContext dbContext,
    ITokenService tokenService,
    IOptions<JwtSettings> jwtSettings) : Endpoint<RefreshTokenRequest, AuthResponse>
{
    public override void Configure()
    {
        Post("/api/auth/refresh");
        AllowAnonymous();
        Summary(s => s.Summary = "Refresh access token");
        Options(x => x.RequireRateLimiting("auth"));
    }

    public override async Task HandleAsync(RefreshTokenRequest req, CancellationToken ct)
    {
        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == req.RefreshToken, ct);

        if (user is null || user.RefreshTokenExpiryTime < DateTime.UtcNow)
        {
            await SendUnauthorizedAsync(ct);
            return;
        }

        var newAccessToken = tokenService.GenerateAccessToken(user);
        var newRefreshToken = tokenService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(jwtSettings.Value.RefreshTokenExpirationDays);

        await dbContext.SaveChangesAsync(ct);

        await SendOkAsync(new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            User = new UserInfo
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                PictureUrl = user.PictureUrl
            }
        }, ct);
    }
}
