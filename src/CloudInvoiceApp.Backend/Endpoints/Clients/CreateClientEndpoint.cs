using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Models;
using CloudInvoiceApp.Backend.Requests;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Clients;

public sealed class CreateClientEndpoint(InvoiceDbContext dbContext) : Endpoint<CreateClientRequest>
{
    public override void Configure()
    {
        Post("/api/clients");
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

        await SendOkAsync(client, ct);
    }
}
