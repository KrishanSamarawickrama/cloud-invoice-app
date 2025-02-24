using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Models;
using CloudInvoiceApp.Backend.Requests;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints;

public sealed class CreateInvoiceEndpoint(InvoiceDbContext dbContext) : Endpoint<CreateInvoiceRequest>
{
    public override void Configure()
    {
        Post("/api/invoices");
        AllowAnonymous();
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
            CreatedDate = DateTime.UtcNow
        };

        dbContext.Invoices.Add(invoice);
        await dbContext.SaveChangesAsync(ct);

        await SendOkAsync(invoice, ct);
    }
}
