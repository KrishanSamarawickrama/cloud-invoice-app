using System.Globalization;
using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Services;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints;

public class DownloadInvoicePdfEndpoint(InvoiceDbContext dbContext) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/invoices/{id:int}/pdf");
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
        // Extract first name from first "from" entry
        var firstName = "Invoice";
        if (from.Count > 0 && !string.IsNullOrWhiteSpace(from[0]))
        {
            firstName = from[0].Split(' ', StringSplitOptions.RemoveEmptyEntries)[0];
        }

        // Parse month and year from date
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

        // Strip hyphens and spaces from invoice number
        var cleanNumber = invoiceNumber.Replace("-", "").Replace(" ", "");

        return $"{firstName}-{month}-{year}-{cleanNumber}.pdf";
    }
}
