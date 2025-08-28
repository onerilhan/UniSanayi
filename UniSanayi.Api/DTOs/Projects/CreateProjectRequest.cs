namespace UniSanayi.Api.DTOs.Projects
{
    public class CreateProjectRequest
    {
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public string ProjectType { get; set; } = default!;
        public int DurationDays { get; set; }
        public decimal? BudgetAmount { get; set; }
        public string? Currency { get; set; } = "TRY";
        public string? LocationCity { get; set; }
        public string? LocationRequirement { get; set; } = "Remote"; // Remote, On-site, Hybrid
        public int? MaxApplicants { get; set; } = 30;
        public DateTimeOffset? ApplicationDeadline { get; set; }
        public DateTimeOffset? ProjectStartDate { get; set; }
    }
}