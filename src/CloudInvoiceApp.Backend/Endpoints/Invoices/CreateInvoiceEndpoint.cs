using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Models;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Responses;
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
            FileName = string.IsNullOrEmpty(req.FileName)
                ? InvoicePdfGenerator.BuildFileName(req.From, req.InvoiceDate.ToString("yyyy-MM-dd"), req.InvoiceNumber)
                : req.FileName,
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

        var response = new InvoiceResponse
        {
            Id = invoice.Id,
            FileName = invoice.FileName,
            InvoiceNumber = invoice.InvoiceNumber,
            InvoiceDate = invoice.InvoiceDate,
            From = JsonSerializer.Deserialize<List<string>>(invoice.From) ?? [],
            To = JsonSerializer.Deserialize<List<string>>(invoice.To) ?? [],
            BankDetails = JsonSerializer.Deserialize<BankDetails>(invoice.BankDetails)!,
            Services = JsonSerializer.Deserialize<List<Service>>(invoice.Services)!
        };

        await Send.OkAsync(response, ct);
    }
}
