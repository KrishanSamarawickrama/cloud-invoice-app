using CloudInvoiceApp.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace CloudInvoiceApp.Backend.Data;

public class InvoiceDbContext(DbContextOptions<InvoiceDbContext> options) : DbContext(options)
{
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.GoogleId).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasOne(i => i.User)
                .WithMany(u => u.Invoices)
                .HasForeignKey(i => i.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
