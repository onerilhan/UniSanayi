namespace UniSanayi.Api.DTOs.Projects
{
    public class ProjectDetailResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public string ProjectType { get; set; } = default!;
        public int DurationDays { get; set; }
        public decimal? BudgetAmount { get; set; }
        public string? Currency { get; set; }
        public string? LocationCity { get; set; }
        public string? LocationRequirement { get; set; }
        public int? MaxApplicants { get; set; }
        public DateTimeOffset? ApplicationDeadline { get; set; }
        public DateTimeOffset? ProjectStartDate { get; set; }
        public string? Status { get; set; }
        public int ViewCount { get; set; }

        // Company bilgileri
        public string CompanyName { get; set; } = default!;
        public string? CompanyIndustry { get; set; }
        public string? CompanyDescription { get; set; }
        public string? CompanyWebsite { get; set; }
        public string? CompanyLocationCity { get; set; }

        // Skill requirements
        public List<ProjectSkillRequirementResponse> SkillRequirements { get; set; } = new();

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }
}