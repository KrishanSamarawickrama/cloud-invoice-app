using System.Text.Json;
using CloudInvoiceApp.Backend.Data;
using CloudInvoiceApp.Backend.Models;

namespace CloudInvoiceApp.Backend.Services;

public class AuditService(InvoiceDbContext dbContext, ILogger<AuditService> logger) : IAuditService
{
    public async Task LogAsync(int? userId, string action, string entityType, int? entityId = null, object? details = null, string? ipAddress = null)
    {
        try
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Details = details is not null ? JsonSerializer.Serialize(details) : null,
                IpAddress = ipAddress,
                Timestamp = DateTime.UtcNow
            };

            dbContext.AuditLogs.Add(auditLog);
            await dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to write audit log: {Action} {EntityType} {EntityId}", action, entityType, entityId);
        }
    }
}
