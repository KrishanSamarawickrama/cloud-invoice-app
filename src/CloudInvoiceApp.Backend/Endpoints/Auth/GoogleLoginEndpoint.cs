using CloudInvoiceApp.Backend.Configuration;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Models;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Responses;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CloudInvoiceApp.Backend.Endpoints.Auth;

public class GoogleLoginEndpoint(
    InvoiceDbContext dbContext,
    ITokenService tokenService,
    IAuditService auditService,
    IOptions<GoogleSettings> googleSettings,
    IOptions<JwtSettings> jwtSettings,
    IWebHostEnvironment env) : Endpoint<GoogleLoginRequest, AuthResponse>
{
    public override void Configure()
    {
        Post("/api/auth/google");
        AllowAnonymous();
        Summary(s => s.Summary = "Authenticate via Google OAuth");
        Options(x => x.RequireRateLimiting("auth"));
    }

    public override async Task HandleAsync(GoogleLoginRequest req, CancellationToken ct)
    {
        GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [googleSettings.Value.ClientId]
            };
            payload = await GoogleJsonWebSignature.ValidateAsync(req.Credential, settings);
        }
        catch (InvalidJwtException)
        {
            await SendUnauthorizedAsync(ct);
            return;
        }

        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.GoogleId == payload.Subject, ct);

        if (user is null)
        {
            user = new User
            {
                GoogleId = payload.Subject,
                Email = payload.Email,
                Name = payload.Name,
                PictureUrl = payload.Picture,
                CreatedDate = DateTime.UtcNow,
                LastLoginDate = DateTime.UtcNow
            };
            dbContext.Users.Add(user);
        }
        else
        {
            user.Name = payload.Name;
            user.PictureUrl = payload.Picture;
            user.LastLoginDate = DateTime.UtcNow;
        }

        var refreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(jwtSettings.Value.RefreshTokenExpirationDays);

        await dbContext.SaveChangesAsync(ct);

        var accessToken = tokenService.GenerateAccessToken(user);

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await auditService.LogAsync(user.Id, "LOGIN", "User", user.Id,
            new { email = user.Email, isNewUser = user.CreatedDate == user.LastLoginDate }, ipAddress);

        CookieHelper.SetRefreshTokenCookie(HttpContext, refreshToken, jwtSettings.Value.RefreshTokenExpirationDays, env.IsDevelopment());

        await SendOkAsync(new AuthResponse
        {
            AccessToken = accessToken,
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
