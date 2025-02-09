using CloudInvoiceApp.Backend.Data;
using Microsoft.EntityFrameworkCore;
using FastEndpoints;
using FastEndpoints.Swagger;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.AddNpgsqlDbContext<InvoiceDbContext>("invoice-db", null,
    optionsBuilder => optionsBuilder.UseNpgsql(npgsqlBuilder =>
        npgsqlBuilder.MigrationsAssembly(typeof(Program).Assembly.GetName().Name)));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        policyBuilder => policyBuilder.WithOrigins("*")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddFastEndpoints().SwaggerDocument();

var app = builder.Build();

app.MapDefaultEndpoints();

app.UseDeveloperExceptionPage();
app.MapOpenApi();

app.UseHttpsRedirection();

app.UseCors("AllowLocalhost");

RunMigrations(app.Services);

app.MapGet("/api/version", () => Results.Ok(new { Version = "v1.0.0", Tag = "20250128" }));
app.UseFastEndpoints().UseSwaggerGen();

app.Run();

void RunMigrations(IServiceProvider serviceProvider)
{
    using var serviceScope = serviceProvider.CreateScope();
    var services = serviceScope.ServiceProvider;

    var dbContext = services.GetRequiredService<InvoiceDbContext>();
    dbContext.Database.Migrate();
    
    DatabaseSeeder.SeedAsync(dbContext).Wait();
}
