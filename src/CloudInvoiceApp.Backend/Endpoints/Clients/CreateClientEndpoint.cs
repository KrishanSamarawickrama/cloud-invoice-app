using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Models;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Clients;

public sealed class CreateClientEndpoint(InvoiceDbContext dbContext, IAuditService auditService) : Endpoint<CreateClientRequest>
{
    public override void Configure()
    {
        Post("/api/clients");
        Summary(s => s.Summary = "Create a new client");
    }

    public override async Task HandleAsync(CreateClientRequest req, CancellationToken ct)
    {
        var client = new Client
        {
            Name = req.Name,
            Email = req.Email,
            Address = JsonSerializer.Serialize(req.Address),
            UserId = User.GetUserId(),
            CreatedDate = DateTime.UtcNow
        };

        dbContext.Clients.Add(client);
        await dbContext.SaveChangesAsync(ct);

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await auditService.LogAsync(client.UserId, "CREATE_CLIENT", "Client", client.Id,
            new { clientId = client.Id, name = client.Name }, ipAddress);

        await Send.OkAsync(client, ct);
    }
}
