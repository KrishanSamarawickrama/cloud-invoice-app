using System.Text;
using CloudInvoiceApp.Backend.Configuration;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FastEndpoints;
using FastEndpoints.Swagger;

var builder = WebApplication.CreateBuilder(args);
QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

builder.AddServiceDefaults();

builder.Configuration.SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", false, true)
    .AddJsonFile("appsettings.local.json", true, true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", true)
    .AddEnvironmentVariables();

builder.AddNpgsqlDbContext<InvoiceDbContext>("invoice-db", null,
    optionsBuilder => optionsBuilder.UseNpgsql(npgsqlBuilder =>
        npgsqlBuilder.MigrationsAssembly(typeof(Program).Assembly.GetName().Name)));

// Bind settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
builder.Services.Configure<GoogleSettings>(builder.Configuration.GetSection("Google"));

// Register services
builder.Services.AddScoped<ITokenService, TokenService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()!;
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration["AllowedOrigins"]?
        .Split(',', StringSplitOptions.RemoveEmptyEntries) ?? [];

    options.AddPolicy("AllowLocalhost",
        policyBuilder =>
        {
            if (allowedOrigins.Length > 0)
                policyBuilder.WithOrigins(allowedOrigins);
            else
                policyBuilder.AllowAnyOrigin();

            policyBuilder.AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithExposedHeaders("Content-Disposition");
        });
});

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddFastEndpoints().SwaggerDocument();

var app = builder.Build();

app.MapDefaultEndpoints();

app.UseDeveloperExceptionPage();
app.MapOpenApi();

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("AllowLocalhost");

app.UseAuthentication();
app.UseAuthorization();

RunMigrations(app.Services);

app.MapGet("/api/version", () => Results.Ok(new { Version = "v1.0.1", Tag = "20250224" }));
app.UseFastEndpoints().UseSwaggerGen();

// SPA fallback — serve index.html for all non-file routes (React Router)
app.MapFallbackToFile("index.html");

app.Run();

void RunMigrations(IServiceProvider serviceProvider)
{
    using var serviceScope = serviceProvider.CreateScope();
    var services = serviceScope.ServiceProvider;

    var dbContext = services.GetRequiredService<InvoiceDbContext>();
    dbContext.Database.Migrate();

    DatabaseSeeder.SeedAsync(dbContext).Wait();
}
