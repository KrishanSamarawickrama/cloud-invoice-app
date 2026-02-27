using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Invoices;

public class UpdateInvoiceEndpoint(InvoiceDbContext dbContext, IAuditService auditService) : Endpoint<UpdateInvoiceRequest>
{
    public override void Configure()
    {
        Put("/api/invoices");
        Summary(s => s.Summary = "Update an existing invoice");
    }

    public override async Task HandleAsync(UpdateInvoiceRequest req, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var invoice = await dbContext.Invoices.FindAsync(req.Id, ct);

        if (invoice is null || invoice.UserId != userId)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        invoice.InvoiceNumber = req.InvoiceNumber;
        invoice.InvoiceDate = req.InvoiceDate.ToString("yyyy-MM-dd");
        invoice.FileName = req.FileName;
        invoice.From = JsonSerializer.Serialize(req.From);
        invoice.To = JsonSerializer.Serialize(req.To);
        invoice.BankDetails = JsonSerializer.Serialize(req.BankDetails);
        invoice.Services = JsonSerializer.Serialize(req.Services);
        invoice.InvoiceTotal = req.Services.Sum(x => x.Amount);

        await dbContext.SaveChangesAsync(ct);

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await auditService.LogAsync(userId, "UPDATE_INVOICE", "Invoice", invoice.Id,
            new { invoiceId = invoice.Id, invoiceNumber = invoice.InvoiceNumber }, ipAddress);

        await Send.OkAsync(invoice, ct);
    }
}
