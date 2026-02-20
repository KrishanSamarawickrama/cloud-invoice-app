using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloudInvoiceApp.Backend.Models;

public sealed class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public required string GoogleId { get; set; }
    public required string Email { get; set; }
    public required string Name { get; set; }
    public string? PictureUrl { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime LastLoginDate { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public ICollection<Invoice> Invoices { get; set; } = [];
}
