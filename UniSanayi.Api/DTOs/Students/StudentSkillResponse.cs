namespace UniSanayi.Api.DTOs.Students
{
    public class StudentSkillResponse
    {
        public Guid Id { get; set; }
        public int SkillId { get; set; }
        public string SkillName { get; set; } = default!;
        public string SkillCategory { get; set; } = default!;
        public string ProficiencyLevel { get; set; } = default!;
        public decimal? YearsOfExperience { get; set; }
        public bool IsVerified { get; set; }
        public DateTimeOffset AddedDate { get; set; }
    }
}