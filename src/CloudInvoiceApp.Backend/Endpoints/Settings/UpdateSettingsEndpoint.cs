using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Settings;

public class UpdateSettingsEndpoint(InvoiceDbContext dbContext, IAuditService auditService)
    : Endpoint<UpdateSettingsRequest>
{
    public override void Configure()
    {
        Put("/api/settings");
        Summary(s => s.Summary = "Update user settings");
    }

    public override async Task HandleAsync(UpdateSettingsRequest req, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var user = await dbContext.Users.FindAsync([userId], cancellationToken: ct);

        if (user is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        user.InvoiceNumberPrefix = req.InvoiceNumberPrefix;

        await dbContext.SaveChangesAsync(ct);

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await auditService.LogAsync(userId, "UPDATE_SETTINGS", "User", userId,
            new { invoiceNumberPrefix = req.InvoiceNumberPrefix }, ipAddress);

        await Send.OkAsync(cancellation: ct);
    }
}
