using System.Globalization;
using CloudInvoiceApp.Backend.Requests;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace CloudInvoiceApp.Backend.Services;

public static class InvoicePdfGenerator
{
    private const string PrimaryColor = "#4B164C";

    public static byte[] Generate(
        string invoiceNumber,
        string invoiceDate,
        List<string> from,
        List<string> to,
        BankDetails bankDetails,
        List<Service> services)
    {
        var formattedDate = FormatDate(invoiceDate);
        var total = services.Sum(s => s.Amount);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Black));

                page.Content().Column(column =>
                {
                    // Title
                    column.Item().Text("CONSULTANCY INVOICE")
                        .Bold().FontSize(22).FontColor(PrimaryColor);

                    // Horizontal rule
                    column.Item().PaddingVertical(8).LineHorizontal(1).LineColor(PrimaryColor);

                    // Invoice number and date
                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Text(text =>
                        {
                            text.Span("Invoice Number: ").Bold();
                            text.Span(invoiceNumber);
                        });
                        row.RelativeItem().AlignRight().Text(text =>
                        {
                            text.Span("Date: ").Bold();
                            text.Span(formattedDate);
                        });
                    });

                    column.Item().PaddingVertical(12);

                    // From section
                    column.Item().Text("FROM").Bold().FontSize(11).FontColor(PrimaryColor);
                    column.Item().PaddingBottom(4);
                    foreach (var line in from)
                    {
                        column.Item().Text(line);
                    }

                    column.Item().PaddingVertical(10);

                    // To section
                    column.Item().Text("TO").Bold().FontSize(11).FontColor(PrimaryColor);
                    column.Item().PaddingBottom(4);
                    foreach (var line in to)
                    {
                        column.Item().Text(line);
                    }

                    column.Item().PaddingVertical(12);

                    // Services table
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.ConstantColumn(120);
                        });

                        // Header
                        table.Header(header =>
                        {
                            header.Cell().Background(PrimaryColor).Padding(8)
                                .Text("SERVICES").Bold().FontColor(Colors.White);
                            header.Cell().Background(PrimaryColor).Padding(8)
                                .AlignRight().Text("AMOUNT").Bold().FontColor(Colors.White);
                        });

                        // Service rows
                        foreach (var service in services)
                        {
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                .Padding(8).Text(service.ServiceName);
                            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                .Padding(8).AlignRight().Text($"${service.Amount:F2}");
                        }

                        // Total row
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(8)
                            .AlignRight().Text("Total").Bold();
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(8)
                            .AlignRight().Text($"${total:F2}").Bold();
                    });

                    column.Item().PaddingVertical(16);

                    // Bank Details
                    column.Item().Text("BANK DETAILS").Bold().FontSize(11).FontColor(PrimaryColor);
                    column.Item().PaddingBottom(4);
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(130);
                            columns.RelativeColumn();
                        });

                        void AddRow(string label, string value)
                        {
                            table.Cell().Padding(4).Text(label).Bold();
                            table.Cell().Padding(4).Text(value);
                        }

                        AddRow("Account Holder:", bankDetails.AccountHolder);
                        AddRow("Bank Name:", bankDetails.BankName);
                        AddRow("Account Number:", bankDetails.AccountNumber);
                        AddRow("SWIFT Code:", bankDetails.SwiftCode);
                    });
                });
            });
        });

        return document.GeneratePdf();
    }

    private static string FormatDate(string dateStr)
    {
        // Try "yyyy-MM-dd" first (from create/update endpoints)
        if (DateOnly.TryParseExact(dateStr, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var dateOnly))
        {
            return dateOnly.ToString("MMMM dd, yyyy", CultureInfo.InvariantCulture);
        }

        // Try "MMMM dd, yyyy" (from seeded data) - already in desired format
        if (DateOnly.TryParseExact(dateStr, "MMMM dd, yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out _))
        {
            return dateStr;
        }

        // Fallback: return as-is
        return dateStr;
    }

    public static string BuildFileName(List<string> from, string invoiceDate, string invoiceNumber)
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
