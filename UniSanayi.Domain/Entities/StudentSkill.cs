using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniSanayi.Domain.Entities
{
    [Table("student_skills")]
    public class StudentSkill
    {
        [Key, Column("id")] public Guid Id { get; set; }

        [Required, Column("student_id")] public Guid StudentId { get; set; }
        [Required, Column("skill_id")] public int SkillId { get; set; }

        [Required, MaxLength(20), Column("proficiency_level")] public string ProficiencyLevel { get; set; } = default!; // Beginner|Intermediate|Advanced|Expert
        [Column("years_of_experience", TypeName = "numeric(3,1)")] public decimal? YearsOfExperience { get; set; } = 0;
        [Column("is_verified")] public bool IsVerified { get; set; } = false;
        [Column("added_date")] public DateTimeOffset AddedDate { get; set; } = DateTimeOffset.UtcNow;

        public Student? Student { get; set; }
        public Skill? Skill { get; set; }
    }
}
