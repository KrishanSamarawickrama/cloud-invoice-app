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
    .WithHttpEndpoint(port: 3000, env: "VITE_PORT")
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();


builder.Build().Run();