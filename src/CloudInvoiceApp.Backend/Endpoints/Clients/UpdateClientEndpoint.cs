using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Requests;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Clients;

public class UpdateClientEndpoint(InvoiceDbContext dbContext) : Endpoint<UpdateClientRequest>
{
    public override void Configure()
    {
        Put("/api/clients");
    }

    public override async Task HandleAsync(UpdateClientRequest req, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var client = await dbContext.Clients.FindAsync(req.Id, ct);

        if (client is null || client.UserId != userId)
        {
            await SendNotFoundAsync(ct);
            return;
        }

        client.Name = req.Name;
        client.Email = req.Email;
        client.Address = JsonSerializer.Serialize(req.Address);

        await dbContext.SaveChangesAsync(ct);
        await SendOkAsync(client, ct);
    }
}
