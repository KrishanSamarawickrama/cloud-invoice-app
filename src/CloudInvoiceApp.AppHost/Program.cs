var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin()
    .WithLifetime(ContainerLifetime.Persistent);

if (builder.ExecutionContext.IsRunMode)
{
    // Data volumes don't work on ACA for Postgres so only add when running
    postgres.WithDataVolume();
}

var invoiceDb = postgres.AddDatabase("invoice-db");

builder.AddProject<Projects.CloudInvoiceApp_Backend>("backend")
    .WithReference(invoiceDb)
    .WaitFor(invoiceDb);

builder.Build().Run();
