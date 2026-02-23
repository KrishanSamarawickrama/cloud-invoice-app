using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloudInvoiceApp.Backend.Models;

public sealed class Client
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Email { get; set; }
    public required string Address { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public DateTime CreatedDate { get; set; }
}
