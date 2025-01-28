using CloudInvoiceApp.Backend.Data;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints;

public class DeleteInvoiceEndpoint(InvoiceDbContext dbContext) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Delete("/api/invoices/{id:int}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<int>("id");
        var invoice = await dbContext.Invoices.FindAsync([id], ct);

        if (invoice is null)
        {
            await SendNotFoundAsync(ct);
            return;
        }

        dbContext.Invoices.Remove(invoice);
        await dbContext.SaveChangesAsync(ct);

        await SendOkAsync(new { Message = "Invoice deleted successfully." }, ct);
    }
}
