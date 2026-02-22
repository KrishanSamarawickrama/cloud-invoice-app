using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Clients;

public class DeleteClientEndpoint(InvoiceDbContext dbContext) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Delete("/api/clients/{id:int}");
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

        await SendOkAsync(new { Message = "Client deleted successfully." }, ct);
    }
}
