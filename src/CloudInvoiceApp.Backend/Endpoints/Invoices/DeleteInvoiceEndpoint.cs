using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Invoices;

public class DeleteInvoiceEndpoint(InvoiceDbContext dbContext, IAuditService auditService) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Delete("/api/invoices/{id:int}");
        Summary(s => s.Summary = "Delete an invoice");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<int>("id");
        var userId = User.GetUserId();
        var invoice = await dbContext.Invoices.FindAsync([id], ct);

        if (invoice is null || invoice.UserId != userId)
        {
            await SendNotFoundAsync(ct);
            return;
        }

        dbContext.Invoices.Remove(invoice);
        await dbContext.SaveChangesAsync(ct);

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await auditService.LogAsync(userId, "DELETE_INVOICE", "Invoice", id,
            new { invoiceId = id }, ipAddress);

        await SendOkAsync(new { Message = "Invoice deleted successfully." }, ct);
    }
}
