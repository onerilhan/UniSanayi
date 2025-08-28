namespace UniSanayi.Api.DTOs.Projects
{
    public class UpdateProjectRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? ProjectType { get; set; }
        public int? DurationDays { get; set; }
        public decimal? BudgetAmount { get; set; }
        public string? Currency { get; set; }
        public string? LocationCity { get; set; }
        public string? LocationRequirement { get; set; }
        public int? MaxApplicants { get; set; }
        public DateTimeOffset? ApplicationDeadline { get; set; }
        public DateTimeOffset? ProjectStartDate { get; set; }
        public string? Status { get; set; } // Draft, Active, Paused, Completed, Cancelled
    }
}