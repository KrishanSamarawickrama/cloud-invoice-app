var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin()
    .WithLifetime(ContainerLifetime.Persistent);

if (builder.ExecutionContext.IsRunMode)
{
    postgres.WithDataVolume();
}

var invoiceDb = postgres.AddDatabase("invoice-db");

builder.AddProject<Projects.CloudInvoiceApp_Backend>("backend")
    .WithReference(invoiceDb)
    .WaitFor(invoiceDb);

builder.Build().Run();
