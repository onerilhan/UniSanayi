using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniSanayi.Domain.Entities
{
    [Table("project_skill_requirements")]
    public class ProjectSkillRequirement
    {
        [Key, Column("id")] public Guid Id { get; set; }

        [Required, Column("project_id")] public Guid ProjectId { get; set; }
        [Required, Column("skill_id")] public int SkillId { get; set; }

        [Required, MaxLength(20), Column("required_level")] public string RequiredLevel { get; set; } = default!; // Beginner|Intermediate|Advanced
        [Column("is_mandatory")] public bool IsMandatory { get; set; } = true;
        [Column("weight_percentage")] public int? WeightPercentage { get; set; } = 10;

        public Project? Project { get; set; }
        public Skill? Skill { get; set; }
    }
}
