using System.Text.Json;
using CloudInvoiceApp.Backend.Models;
using CloudInvoiceApp.Backend.Requests;
using Microsoft.EntityFrameworkCore;

namespace CloudInvoiceApp.Backend.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(InvoiceDbContext dbContext)
    {
        // Check if the database is already seeded
        if (await dbContext.Invoices.AnyAsync()) return;

        // Add sample data
        var invoices = new List<Invoice>
        {
            new Invoice
            {
                FileName = "invoice1.pdf",
                InvoiceNumber = "00-000001",
                InvoiceDate = DateTime.Now.ToString("MMMM dd, yyyy"),
                From = JsonSerializer.Serialize(new List<string> { "Company A", "Address A" }),
                To = JsonSerializer.Serialize(new List<string> { "Company B", "Address B" }),
                BankDetails = JsonSerializer.Serialize(new BankDetails
                {
                    AccountHolder = "John Doe",
                    BankName = "Bank A",
                    AccountNumber = "123456789",
                    SwiftCode = "SWIFT123"
                }),
                Services = JsonSerializer.Serialize(new List<Service>
                {
                    new Service { ServiceName = "Service 1", Amount = 100.0 },
                    new Service { ServiceName = "Service 2", Amount = 200.0 }
                }),
                InvoiceTotal = 300.0,
                CreatedDate = DateTime.UtcNow
            },
            new Invoice
            {
                FileName = "invoice2.pdf",
                InvoiceNumber = "00-000002",
                InvoiceDate = DateTime.Now.ToString("MMMM dd, yyyy"),
                From = JsonSerializer.Serialize(new List<string> { "Company C", "Address C" }),
                To = JsonSerializer.Serialize(new List<string> { "Company D", "Address D" }),
                BankDetails = JsonSerializer.Serialize(new BankDetails
                {
                    AccountHolder = "Jane Smith",
                    BankName = "Bank B",
                    AccountNumber = "987654321",
                    SwiftCode = "SWIFT456"
                }),
                Services = JsonSerializer.Serialize(new List<Service>
                {
                    new Service { ServiceName = "Service 3", Amount = 150.0 },
                    new Service { ServiceName = "Service 4", Amount = 250.0 }
                }),
                InvoiceTotal = 400.0,
                CreatedDate = DateTime.UtcNow
            },
            new Invoice
            {
                FileName = "invoice3.pdf",
                InvoiceNumber = "00-000003",
                InvoiceDate = DateTime.Now.ToString("MMMM dd, yyyy"),
                From = JsonSerializer.Serialize(new List<string> { "Company E", "Address E" }),
                To = JsonSerializer.Serialize(new List<string> { "Company F", "Address F" }),
                BankDetails = JsonSerializer.Serialize(new BankDetails
                {
                    AccountHolder = "Alice Johnson",
                    BankName = "Bank C",
                    AccountNumber = "123123123",
                    SwiftCode = "SWIFT789"
                }),
                Services = JsonSerializer.Serialize(new List<Service>
                {
                    new Service { ServiceName = "Service 5", Amount = 200.0 },
                    new Service { ServiceName = "Service 6", Amount = 300.0 }
                }),
                InvoiceTotal = 500.0,
                CreatedDate = DateTime.UtcNow
            },
            new Invoice
            {
                FileName = "invoice4.pdf",
                InvoiceNumber = "00-000004",
                InvoiceDate = DateTime.Now.ToString("MMMM dd, yyyy"),
                From = JsonSerializer.Serialize(new List<string> { "Company G", "Address G" }),
                To = JsonSerializer.Serialize(new List<string> { "Company H", "Address H" }),
                BankDetails = JsonSerializer.Serialize(new BankDetails
                {
                    AccountHolder = "Bob Brown",
                    BankName = "Bank D",
                    AccountNumber = "321321321",
                    SwiftCode = "SWIFT012"
                }),
                Services = JsonSerializer.Serialize(new List<Service>
                {
                    new Service { ServiceName = "Service 7", Amount = 250.0 },
                    new Service { ServiceName = "Service 8", Amount = 350.0 }
                }),
                InvoiceTotal = 600.0,
                CreatedDate = DateTime.UtcNow
            },
            new Invoice
            {
                FileName = "invoice5.pdf",
                InvoiceNumber = "00-000005",
                InvoiceDate = DateTime.Now.ToString("MMMM dd, yyyy"),
                From = JsonSerializer.Serialize(new List<string> { "Company I", "Address I" }),
                To = JsonSerializer.Serialize(new List<string> { "Company J", "Address J" }),
                BankDetails = JsonSerializer.Serialize(new BankDetails
                {
                    AccountHolder = "Charlie Davis",
                    BankName = "Bank E",
                    AccountNumber = "456456456",
                    SwiftCode = "SWIFT345"
                }),
                Services = JsonSerializer.Serialize(new List<Service>
                {
                    new Service { ServiceName = "Service 9", Amount = 300.0 },
                    new Service { ServiceName = "Service 10", Amount = 400.0 }
                }),
                InvoiceTotal = 700.0,
                CreatedDate = DateTime.UtcNow
            }
        };
        
        await dbContext.Invoices.AddRangeAsync(invoices);
        await dbContext.SaveChangesAsync();
    }
}

