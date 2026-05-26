using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Profile;

public class UpdateProfileEndpoint(InvoiceDbContext dbContext, IAuditService auditService) : Endpoint<UpdateProfileRequest>
{
    public override void Configure()
    {
        Put("/api/profile");
        Summary(s => s.Summary = "Update user profile");
    }

    public override async Task HandleAsync(UpdateProfileRequest req, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var user = await dbContext.Users.FindAsync([userId], cancellationToken: ct);

        if (user is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        user.DefaultFromAddress = req.DefaultFromAddress is not null
            ? JsonSerializer.Serialize(req.DefaultFromAddress)
            : null;

        user.DefaultBankDetails = req.DefaultBankDetails is not null
            ? JsonSerializer.Serialize(req.DefaultBankDetails)
            : null;

        await dbContext.SaveChangesAsync(ct);

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await auditService.LogAsync(userId, "UPDATE_PROFILE", "User", userId, ipAddress: ipAddress);

        await Send.OkAsync(cancellation: ct);
    }
}
