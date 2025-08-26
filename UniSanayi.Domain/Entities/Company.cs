using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniSanayi.Domain.Entities
{
    [Table("companies")]
    public class Company
    {
        [Key, Column("id")] public Guid Id { get; set; }
        [Required, Column("user_id")] public Guid UserId { get; set; }

        [Required, MaxLength(255), Column("company_name")] public string CompanyName { get; set; } = default!;
        [MaxLength(100), Column("industry")] public string? Industry { get; set; }
        [MaxLength(50), Column("company_size")] public string? CompanySize { get; set; }  // '1-10', '11-50', ...
        [MaxLength(255), Column("website")] public string? Website { get; set; }
        [Column("description")] public string? Description { get; set; }
        [Required, MaxLength(255), Column("contact_person")] public string ContactPerson { get; set; } = default!;
        [MaxLength(20), Column("contact_phone")] public string? ContactPhone { get; set; }
        [MaxLength(255), Column("contact_email")] public string? ContactEmail { get; set; }
        [MaxLength(100), Column("location_city")] public string? LocationCity { get; set; }
        [Column("is_verified")] public bool IsVerified { get; set; } = false;
        [Column("created_at")] public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        public User? User { get; set; }
    }
}
