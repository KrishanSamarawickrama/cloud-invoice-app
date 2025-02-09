using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloudInvoiceApp.Backend.Models;

public sealed class Invoice
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public string? FileName { get; set; }
    public required string InvoiceNumber { get; set; } = " 00-000000";
    public required string InvoiceDate { get; set; } = DateTime.Now.ToString("MMMM dd, yyyy"); //January 24, 2024
    public required string From { get; set; }
    public required string To { get; set; }
    public required string BankDetails { get; set; }
    public required string Services { get; set; }
    public double InvoiceTotal { get; set; }
    public DateTime CreatedDate { get; set; }
}