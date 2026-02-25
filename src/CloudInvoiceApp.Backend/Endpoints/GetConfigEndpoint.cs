using CloudInvoiceApp.Backend.Responses;
using FastEndpoints;

namespace CloudInvoiceApp.Backend.Endpoints;

public class GetConfigEndpoint(IConfiguration configuration) : EndpointWithoutRequest<ConfigResponse>
{
    public override void Configure()
    {
        Get("/api/config");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var googleClientId = configuration["Google:ClientId"] ?? "";
        await SendOkAsync(new ConfigResponse { GoogleClientId = googleClientId }, ct);
    }
}
