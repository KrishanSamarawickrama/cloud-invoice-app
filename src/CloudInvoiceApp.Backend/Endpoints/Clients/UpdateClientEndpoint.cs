using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Responses;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Clients;

public class UpdateClientEndpoint(InvoiceDbContext dbContext, IAuditService auditService) : Endpoint<UpdateClientRequest>
{
    public override void Configure()
    {
        Put("/api/clients");
        Summary(s => s.Summary = "Update a client");
    }

    public override async Task HandleAsync(UpdateClientRequest req, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var client = await dbContext.Clients.FindAsync(req.Id, ct);

        if (client is null || client.UserId != userId)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        client.Name = req.Name;
        client.Email = req.Email;
        client.Address = JsonSerializer.Serialize(req.Address);

        await dbContext.SaveChangesAsync(ct);

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await auditService.LogAsync(userId, "UPDATE_CLIENT", "Client", client.Id,
            new { clientId = client.Id, name = client.Name }, ipAddress);

        var response = new ClientResponse
        {
            Id = client.Id,
            Name = client.Name,
            Email = client.Email,
            Address = JsonSerializer.Deserialize<List<string>>(client.Address) ?? [],
            CreatedDate = client.CreatedDate
        };

        await Send.OkAsync(response, ct);
    }
}
