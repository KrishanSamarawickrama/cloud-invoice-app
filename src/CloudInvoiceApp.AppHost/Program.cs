using Microsoft.Extensions.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin()
    .WithLifetime(ContainerLifetime.Persistent);

if (builder.ExecutionContext.IsRunMode)
{
    postgres.WithDataVolume();
}

var invoiceDb = postgres.AddDatabase("invoice-db");

var backend = builder.AddProject<Projects.CloudInvoiceApp_Backend>("backend")
    .WithReference(invoiceDb)
    .WaitFor(invoiceDb);

var frontend = builder.AddViteApp("frontend", "../CloudInvoiceApp.Web")
    .WithReference(backend)
    .WaitFor(backend)
    .WithEnvironment(context =>
    {
        var backendUrl = backend.GetEndpoint("http");
        context.EnvironmentVariables["VITE_API_BASE_URL"] = ReferenceExpression.Create($"{backendUrl}/api");
    })
    .WithEndpoint("http", endpoint =>
    {
        endpoint.Port = 3000;
        endpoint.IsProxied = false;
    })
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();


builder.Build().Run();