using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniSanayi.Domain.Entities
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required, MaxLength(255)]
        [Column("email")]
        public string Email { get; set; } = default!;

        [Required, MaxLength(255)]
        [Column("password_hash")]
        public string PasswordHash { get; set; } = default!;

        // 'student' | 'company' | 'admin'
        [Required, MaxLength(20)]
        [Column("user_type")]
        public string UserType { get; set; } = "student";

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("email_verified")]
        public bool EmailVerified { get; set; } = false;

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        [Column("updated_at")]
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

        // Navigationlar
        public Student? Student { get; set; }
        public Company? Company { get; set; }
    }
}
