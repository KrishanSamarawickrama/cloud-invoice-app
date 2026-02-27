using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CloudInvoiceApp.Backend.Responses;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Auth;

public class MeEndpoint : EndpointWithoutRequest<UserInfo>
{
    public override void Configure()
    {
        Get("/api/auth/me");
        Summary(s => s.Summary = "Get current user info");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = int.Parse(
            User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? "0");

        await Send.OkAsync(new UserInfo
        {
            Id = userId,
            Email = User.FindFirstValue(JwtRegisteredClaimNames.Email)
                    ?? User.FindFirstValue(ClaimTypes.Email) ?? "",
            Name = User.FindFirstValue("name") ?? "",
            PictureUrl = User.FindFirstValue("picture")
        }, ct);
    }
}
