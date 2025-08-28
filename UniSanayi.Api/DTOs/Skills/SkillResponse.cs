namespace UniSanayi.Api.DTOs.Skills
{
    public class SkillResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string Category { get; set; } = default!;
        public string? DifficultyLevel { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }
}