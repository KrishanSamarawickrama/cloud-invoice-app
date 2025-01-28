using CloudInvoiceApp.Backend.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CloudInvoiceApp.Backend.Endpoints;

public class GetInvoicesEndpoint(InvoiceDbContext dbContext) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/invoices");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var invoices = await dbContext.Invoices.ToListAsync(ct);
        await SendOkAsync(invoices, ct);
    }
}
