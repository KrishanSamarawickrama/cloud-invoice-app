using CloudInvoiceApp.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace CloudInvoiceApp.Backend.Data;

public class InvoiceDbContext(DbContextOptions<InvoiceDbContext> options) : DbContext(options)
{
    public DbSet<Invoice> Invoices { get; set; }
}