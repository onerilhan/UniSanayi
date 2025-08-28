namespace UniSanayi.Api.DTOs.Students
{
    public class AddStudentSkillRequest
    {
        public int SkillId { get; set; }
        public string ProficiencyLevel { get; set; } = default!; // "Beginner", "Intermediate", "Advanced", "Expert"
        public decimal? YearsOfExperience { get; set; }
    }
}