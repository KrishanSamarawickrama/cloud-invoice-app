using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Models;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Invoices;

public sealed class CreateInvoiceEndpoint(InvoiceDbContext dbContext, IAuditService auditService) : Endpoint<CreateInvoiceRequest>
{
    public override void Configure()
    {
        Post("/api/invoices");
        Summary(s => s.Summary = "Create a new invoice");
    }

    public override async Task HandleAsync(CreateInvoiceRequest req, CancellationToken ct)
    {
        var invoice = new Invoice
        {
            FileName = req.FileName,
            InvoiceDate = req.InvoiceDate.ToString("yyyy-MM-dd"),
            InvoiceNumber = req.InvoiceNumber,
            From = JsonSerializer.Serialize(req.From),
            To = JsonSerializer.Serialize(req.To),
            BankDetails = JsonSerializer.Serialize(req.BankDetails),
            Services = JsonSerializer.Serialize(req.Services),
            InvoiceTotal = req.Services.Sum(x=>x.Amount),
            CreatedDate = DateTime.UtcNow,
            UserId = User.GetUserId()
        };

        dbContext.Invoices.Add(invoice);
        await dbContext.SaveChangesAsync(ct);

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await auditService.LogAsync(invoice.UserId, "CREATE_INVOICE", "Invoice", invoice.Id,
            new { invoiceId = invoice.Id, invoiceNumber = invoice.InvoiceNumber, amount = invoice.InvoiceTotal }, ipAddress);

        await SendOkAsync(invoice, ct);
    }
}
