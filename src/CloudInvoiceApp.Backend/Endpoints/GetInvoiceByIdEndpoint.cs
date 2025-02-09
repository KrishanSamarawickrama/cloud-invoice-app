using CloudInvoiceApp.Backend.Data;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints;

public class GetInvoiceByIdEndpoint(InvoiceDbContext dbContext) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/invoices/{id:int}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<int>("id");
        var invoice = await dbContext.Invoices.FindAsync([id], cancellationToken: ct);

        if (invoice is null)
        {
            await SendNotFoundAsync(ct);
            return;
        }

        await SendOkAsync(invoice, ct);
    }
}
