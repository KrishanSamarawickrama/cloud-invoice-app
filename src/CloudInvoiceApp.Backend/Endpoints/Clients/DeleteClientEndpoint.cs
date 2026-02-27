using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Clients;

public class DeleteClientEndpoint(InvoiceDbContext dbContext, IAuditService auditService) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Delete("/api/clients/{id:int}");
        Summary(s => s.Summary = "Delete a client");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<int>("id");
        var userId = User.GetUserId();
        var client = await dbContext.Clients.FindAsync([id], ct);

        if (client is null || client.UserId != userId)
        {
            await SendNotFoundAsync(ct);
            return;
        }

        dbContext.Clients.Remove(client);
        await dbContext.SaveChangesAsync(ct);

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await auditService.LogAsync(userId, "DELETE_CLIENT", "Client", id,
            new { clientId = id }, ipAddress);

        await SendOkAsync(new { Message = "Client deleted successfully." }, ct);
    }
}
