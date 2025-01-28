using CloudInvoiceApp.Backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.AddNpgsqlDbContext<InvoiceDbContext>("invoice-db", null,
    optionsBuilder => optionsBuilder.UseNpgsql(npgsqlBuilder =>
        npgsqlBuilder.MigrationsAssembly(typeof(Program).Assembly.GetName().Name)));

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.MapDefaultEndpoints();

app.UseDeveloperExceptionPage();
app.MapOpenApi();
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// Add a test endpoint.
app.MapGet("/api/test", () => Results.Ok(new { Message = "API is working!" }));


RunMigrations(app.Services);

app.Run();

void RunMigrations(IServiceProvider serviceProvider)
{
    using var serviceScope = serviceProvider.CreateScope();
    var services = serviceScope.ServiceProvider;

    var dbContext = services.GetRequiredService<InvoiceDbContext>();
    dbContext.Database.Migrate();
}
