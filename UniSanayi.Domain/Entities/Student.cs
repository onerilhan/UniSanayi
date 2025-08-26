using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniSanayi.Domain.Entities
{
    [Table("students")]
    public class Student
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [Required, MaxLength(100)]
        [Column("first_name")]
        public string FirstName { get; set; } = default!;

        [Required, MaxLength(100)]
        [Column("last_name")]
        public string LastName { get; set; } = default!;

        [MaxLength(50)]
        [Column("student_number")]
        public string? StudentNumber { get; set; }

        [Required, MaxLength(255)]
        [Column("university_name")]
        public string UniversityName { get; set; } = default!;

        [Required, MaxLength(255)]
        [Column("department")]
        public string Department { get; set; } = default!;

        [Column("current_year")]
        public int? CurrentYear { get; set; }  // 1..6

        [Column("graduation_year")]
        public int? GraduationYear { get; set; }

        [Column("gpa", TypeName = "numeric(3,2)")]
        public decimal? Gpa { get; set; }  // 0.00..4.00

        [MaxLength(20)]
        [Column("phone")]
        public string? Phone { get; set; }

        [MaxLength(100)]
        [Column("location_city")]
        public string? LocationCity { get; set; }

        [Column("bio")]
        public string? Bio { get; set; }

        [MaxLength(255)]
        [Column("linkedin_url")]
        public string? LinkedinUrl { get; set; }

        [MaxLength(255)]
        [Column("github_url")]
        public string? GithubUrl { get; set; }

        [Column("is_available")]
        public bool IsAvailable { get; set; } = true;

        [Column("created_at")]
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        // Navigation (FK -> users.id)
        public User? User { get; set; }
    }
}
