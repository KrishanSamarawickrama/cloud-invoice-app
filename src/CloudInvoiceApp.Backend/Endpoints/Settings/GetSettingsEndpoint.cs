using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Responses;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Settings;

public class GetSettingsEndpoint(InvoiceDbContext dbContext) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/settings");
        Summary(s => s.Summary = "Get user settings");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = User.GetUserId();
        var user = await dbContext.Users.FindAsync([userId], cancellationToken: ct);

        if (user is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = new SettingsResponse
        {
            InvoiceNumberPrefix = user.InvoiceNumberPrefix
        };

        await Send.OkAsync(response, ct);
    }
}
