using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniSanayi.Domain.Entities
{
    [Table("applications")]
    public class Application
    {
        [Key, Column("id")] public Guid Id { get; set; }

        [Required, Column("project_id")] public Guid ProjectId { get; set; }
        [Required, Column("student_id")] public Guid StudentId { get; set; }

        [Column("cover_letter")] public string? CoverLetter { get; set; }
        [MaxLength(20), Column("application_status")] public string? ApplicationStatus { get; set; } = "Pending"; // Pending|Reviewed|Accepted|Rejected
        [Column("applied_at")] public DateTimeOffset AppliedAt { get; set; } = DateTimeOffset.UtcNow;
        [Column("reviewed_at")] public DateTimeOffset? ReviewedAt { get; set; }

        public Project? Project { get; set; }
        public Student? Student { get; set; }
    }
}
