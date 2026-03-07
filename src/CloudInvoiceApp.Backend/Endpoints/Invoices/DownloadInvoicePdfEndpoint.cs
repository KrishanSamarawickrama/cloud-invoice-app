using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints.Invoices;

public class DownloadInvoicePdfEndpoint(InvoiceDbContext dbContext) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/invoices/{id:int}/pdf");
        Summary(s => s.Summary = "Download invoice as PDF");
        Options(x => x.RequireRateLimiting("pdf"));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<int>("id");
        var userId = User.GetUserId();
        var invoice = await dbContext.Invoices.FindAsync([id], cancellationToken: ct);

        if (invoice is null || invoice.UserId != userId)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        var from = JsonSerializer.Deserialize<List<string>>(invoice.From) ?? [];
        var to = JsonSerializer.Deserialize<List<string>>(invoice.To) ?? [];
        var bankDetails = JsonSerializer.Deserialize<BankDetails>(invoice.BankDetails)!;
        var services = JsonSerializer.Deserialize<List<Service>>(invoice.Services)!;

        var pdfBytes = InvoicePdfGenerator.Generate(
            invoice.InvoiceNumber,
            invoice.InvoiceDate,
            from, to, bankDetails, services);

        var fileName = invoice.FileName ?? InvoicePdfGenerator.BuildFileName(from, invoice.InvoiceDate, invoice.InvoiceNumber);

        await Send.BytesAsync(pdfBytes, fileName, "application/pdf", cancellation: ct);
    }
}
