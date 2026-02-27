using CloudInvoiceApp.Backend.Configuration;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Responses;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CloudInvoiceApp.Backend.Endpoints.Auth;

public class RefreshTokenEndpoint(
    InvoiceDbContext dbContext,
    ITokenService tokenService,
    IOptions<JwtSettings> jwtSettings,
    IWebHostEnvironment env) : EndpointWithoutRequest<AuthResponse>
{
    public override void Configure()
    {
        Post("/api/auth/refresh");
        AllowAnonymous();
        Summary(s => s.Summary = "Refresh access token");
        Options(x => x.RequireRateLimiting("auth"));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var refreshToken = CookieHelper.GetRefreshToken(HttpContext);

        if (string.IsNullOrEmpty(refreshToken))
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken, ct);

        if (user is null || user.RefreshTokenExpiryTime < DateTime.UtcNow)
        {
            CookieHelper.ClearRefreshTokenCookie(HttpContext, env.IsDevelopment());
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var newAccessToken = tokenService.GenerateAccessToken(user);
        var newRefreshToken = tokenService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(jwtSettings.Value.RefreshTokenExpirationDays);

        await dbContext.SaveChangesAsync(ct);

        CookieHelper.SetRefreshTokenCookie(HttpContext, newRefreshToken, jwtSettings.Value.RefreshTokenExpirationDays, env.IsDevelopment());

        await Send.OkAsync(new AuthResponse
        {
            AccessToken = newAccessToken,
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
