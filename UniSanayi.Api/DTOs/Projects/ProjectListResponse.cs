namespace UniSanayi.Api.DTOs.Projects
{
    public class ProjectListResponse
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
        public DateTimeOffset? ApplicationDeadline { get; set; }
        public string CompanyName { get; set; } = default!;
        public string? CompanyIndustry { get; set; }
        public int ViewCount { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}