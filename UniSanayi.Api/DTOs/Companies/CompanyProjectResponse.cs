namespace UniSanayi.Api.DTOs.Companies
{
    public class CompanyProjectResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ProjectType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public decimal? BudgetAmount { get; set; }
        public string? Currency { get; set; }
        public string? LocationCity { get; set; }
        public string? LocationRequirement { get; set; }
        public int? MaxApplicants { get; set; }
        public DateTimeOffset? ApplicationDeadline { get; set; }
        public DateTimeOffset? ProjectStartDate { get; set; }
        public int ViewCount { get; set; }
        public int ApplicationsCount { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }
}