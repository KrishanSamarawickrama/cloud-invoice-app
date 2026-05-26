using System.Text.RegularExpressions;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Extensions;
using CloudInvoiceApp.Backend.Responses;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace CloudInvoiceApp.Backend.Endpoints.Invoices;

public class GetNextInvoiceNumberEndpoint(InvoiceDbContext dbContext) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/api/invoices/next-number");
        Summary(s => s.Summary = "Compute the next invoice number for the current user's prefix");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var userId = User.GetUserId();
        var user = await dbContext.Users.FindAsync([userId], cancellationToken: ct);

        if (user is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        var prefix = user.InvoiceNumberPrefix;
        if (string.IsNullOrEmpty(prefix))
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        var likePattern = $"{prefix}-%";
        var candidates = await dbContext.Invoices
            .Where(i => i.UserId == userId && EF.Functions.Like(i.InvoiceNumber, likePattern))
            .Select(i => i.InvoiceNumber)
            .ToListAsync(ct);

        var pattern = new Regex($"^{Regex.Escape(prefix)}-(\\d+)$");
        var maxSeq = 0;
        foreach (var num in candidates)
        {
            var m = pattern.Match(num);
            if (m.Success && int.TryParse(m.Groups[1].Value, out var seq) && seq > maxSeq)
            {
                maxSeq = seq;
            }
        }

        var next = maxSeq + 1;
        var response = new NextInvoiceNumberResponse
        {
            InvoiceNumber = $"{prefix}-{next:D6}"
        };

        await Send.OkAsync(response, ct);
    }
}
