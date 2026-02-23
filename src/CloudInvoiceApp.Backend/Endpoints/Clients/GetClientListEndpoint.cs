using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Responses;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CloudInvoiceApp.Backend.Endpoints.Clients;

public class GetClientListEndpoint(InvoiceDbContext dbContext) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/clients");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = User.GetUserId();
        var clients = await dbContext.Clients
            .Where(c => c.UserId == userId)
            .Select(c => new ClientListResponse
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email
            })
            .ToListAsync(ct);

        await SendOkAsync(clients, ct);
    }
}
