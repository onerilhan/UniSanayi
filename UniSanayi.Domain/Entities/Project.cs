using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniSanayi.Domain.Entities
{
    [Table("projects")]
    public class Project
    {
        [Key, Column("id")] public Guid Id { get; set; }
        [Required, Column("company_id")] public Guid CompanyId { get; set; }

        [Required, MaxLength(255), Column("title")] public string Title { get; set; } = default!;
        [Required, Column("description")] public string Description { get; set; } = default!;
        [Required, MaxLength(50), Column("project_type")] public string ProjectType { get; set; } = default!;
        [Required, Column("duration_days")] public int DurationDays { get; set; }
        [Column("budget_amount", TypeName = "numeric(10,2)")] public decimal? BudgetAmount { get; set; }
        [MaxLength(10), Column("currency")] public string? Currency { get; set; } = "TRY";
        [MaxLength(100), Column("location_city")] public string? LocationCity { get; set; }
        [MaxLength(50), Column("location_requirement")] public string? LocationRequirement { get; set; } = "Remote"; // Remote|On-site|Hybrid
        [Column("max_applicants")] public int? MaxApplicants { get; set; } = 30;
        [Column("application_deadline")] public DateTimeOffset? ApplicationDeadline { get; set; }
        [Column("project_start_date")] public DateTimeOffset? ProjectStartDate { get; set; }
        [MaxLength(20), Column("status")] public string? Status { get; set; } = "Draft"; // Draft|Active|Paused|Completed|Cancelled
        [Column("view_count")] public int ViewCount { get; set; } = 0;
        [Column("created_at")] public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        [Column("updated_at")] public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

        public Company? Company { get; set; }
    }
}
