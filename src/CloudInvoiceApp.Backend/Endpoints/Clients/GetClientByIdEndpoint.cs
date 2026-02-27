using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Responses;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Clients;

public class GetClientByIdEndpoint(InvoiceDbContext dbContext) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/clients/{id:int}");
        Summary(s => s.Summary = "Get client by ID");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<int>("id");
        var userId = User.GetUserId();
        var client = await dbContext.Clients.FindAsync([id], cancellationToken: ct);

        if (client is null || client.UserId != userId)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

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
