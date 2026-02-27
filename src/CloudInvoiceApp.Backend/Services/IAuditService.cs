namespace CloudInvoiceApp.Backend.Services;

public interface IAuditService
{
    Task LogAsync(int? userId, string action, string entityType, int? entityId = null, object? details = null, string? ipAddress = null);
}
