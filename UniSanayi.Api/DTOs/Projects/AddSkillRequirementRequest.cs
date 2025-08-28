namespace UniSanayi.Api.DTOs.Projects
{
    public class AddSkillRequirementRequest
    {
        public int SkillId { get; set; }
        public string RequiredLevel { get; set; } = default!; // Beginner, Intermediate, Advanced
        public bool? IsMandatory { get; set; } = true;
        public int? WeightPercentage { get; set; } = 10;
    }
}