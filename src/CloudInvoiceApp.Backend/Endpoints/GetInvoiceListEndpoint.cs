using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Requests;
using CloudInvoiceApp.Backend.Responses;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CloudInvoiceApp.Backend.Endpoints;

public class GetInvoiceListEndpoint(InvoiceDbContext dbContext) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/invoices/list");
        Summary(s => s.Summary = "List all invoices");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = User.GetUserId();
        var invoices = await dbContext.Invoices
            .Where(i => i.UserId == userId)
            .ToListAsync(ct);

        var invoicesResponse = invoices.Select(x => new InvoiceListResponse
            {
                Id = x.Id,
                FileName = x.FileName,
                InvoiceNumber = x.InvoiceNumber,
                InvoiceDate = x.InvoiceDate,
                Amount = JsonSerializer.Deserialize<List<Service>>(x.Services)!.Sum(x=>x.Amount)
            });

        await SendOkAsync(invoicesResponse, ct);
    }
}
