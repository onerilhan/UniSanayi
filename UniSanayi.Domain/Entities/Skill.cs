using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniSanayi.Domain.Entities
{
    [Table("skills")]
    public class Skill
    {
        [Key, Column("id")] public int Id { get; set; } // SERIAL
        [Required, MaxLength(100), Column("name")] public string Name { get; set; } = default!;
        [Required, MaxLength(50), Column("category")] public string Category { get; set; } = default!;
        [MaxLength(20), Column("difficulty_level")] public string? DifficultyLevel { get; set; } // Beginner|Intermediate|Advanced
        [Column("description")] public string? Description { get; set; }
        [Column("is_active")] public bool IsActive { get; set; } = true;
        [Column("created_at")] public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
