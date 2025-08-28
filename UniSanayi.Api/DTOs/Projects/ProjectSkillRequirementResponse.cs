namespace UniSanayi.Api.DTOs.Projects
{
    public class ProjectSkillRequirementResponse
    {
        public int SkillId { get; set; }
        public string SkillName { get; set; } = default!;
        public string SkillCategory { get; set; } = default!;
        public string RequiredLevel { get; set; } = default!; // Beginner, Intermediate, Advanced
        public bool IsMandatory { get; set; }
        public int? WeightPercentage { get; set; }
    }
}