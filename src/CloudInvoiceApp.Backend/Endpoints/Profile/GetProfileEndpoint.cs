using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Responses;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Profile;

public class GetProfileEndpoint(InvoiceDbContext dbContext) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/profile");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = User.GetUserId();
        var user = await dbContext.Users.FindAsync([userId], cancellationToken: ct);

        if (user is null)
        {
            await SendNotFoundAsync(ct);
            return;
        }

        var response = new ProfileResponse
        {
            Email = user.Email,
            Name = user.Name,
            PictureUrl = user.PictureUrl,
            DefaultFromAddress = user.DefaultFromAddress is not null
                ? JsonSerializer.Deserialize<List<string>>(user.DefaultFromAddress)
                : null,
            DefaultBankDetails = user.DefaultBankDetails is not null
                ? JsonSerializer.Deserialize<BankDetails>(user.DefaultBankDetails)
                : null
        };

        await SendOkAsync(response, ct);
    }
}
