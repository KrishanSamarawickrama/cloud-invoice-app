using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Responses;
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
        
        InvoiceResponse invoiceResponse = new()
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
        

        await SendOkAsync(invoiceResponse, ct);
    }
}
