using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Requests;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints;

public class UpdateInvoiceEndpoint(InvoiceDbContext dbContext) : Endpoint<UpdateInvoiceRequest>
{
    public override void Configure()
    {
        Put("/api/invoices");
        AllowAnonymous();
    }

    public override async Task HandleAsync(UpdateInvoiceRequest req, CancellationToken ct)
    {
        var invoice = await dbContext.Invoices.FindAsync(req.Id);

        if (invoice is null)
        {
            await SendNotFoundAsync(ct);
            return;
        }
        
        invoice.InvoiceNumber = req.InvoiceNumber;
        invoice.InvoiceDate = req.InvoiceDate;
        invoice.FileName = req.FileName;
        invoice.From = JsonSerializer.Serialize(req.From);
        invoice.To = JsonSerializer.Serialize(req.To);
        invoice.BankDetails = JsonSerializer.Serialize(req.BankDetails);
        invoice.Services = JsonSerializer.Serialize(req.Services);
        invoice.InvoiceTotal = req.Services.Sum(x => x.Amount);

        await dbContext.SaveChangesAsync(ct);
        await SendOkAsync(invoice, ct);
    }
}
