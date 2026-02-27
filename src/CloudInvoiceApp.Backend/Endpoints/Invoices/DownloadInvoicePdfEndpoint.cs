using System.Globalization;
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
            await SendNotFoundAsync(ct);
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

        var fileName = BuildFileName(from, invoice.InvoiceDate, invoice.InvoiceNumber);

        await SendBytesAsync(pdfBytes, fileName, "application/pdf", cancellation: ct);
    }

    private static string BuildFileName(List<string> from, string invoiceDate, string invoiceNumber)
    {
        var firstName = "Invoice";
        if (from.Count > 0 && !string.IsNullOrWhiteSpace(from[0]))
        {
            firstName = from[0].Split(' ', StringSplitOptions.RemoveEmptyEntries)[0];
        }

        var month = "Unknown";
        var year = DateTime.Now.Year.ToString();

        if (DateOnly.TryParseExact(invoiceDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d1))
        {
            month = d1.ToString("MMMM", CultureInfo.InvariantCulture);
            year = d1.Year.ToString();
        }
        else if (DateOnly.TryParseExact(invoiceDate, "MMMM dd, yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d2))
        {
            month = d2.ToString("MMMM", CultureInfo.InvariantCulture);
            year = d2.Year.ToString();
        }

        var cleanNumber = invoiceNumber.Replace("-", "").Replace(" ", "");

        return $"{firstName}-{month}-{year}-{cleanNumber}.pdf";
    }
}
