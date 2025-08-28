namespace UniSanayi.Api.DTOs.Projects
{
    public class MyProjectResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = default!;
        public string ProjectType { get; set; } = default!;
        public string? Status { get; set; }
        public int DurationDays { get; set; }
        public decimal? BudgetAmount { get; set; }
        public string? Currency { get; set; }
        public DateTimeOffset? ApplicationDeadline { get; set; }
        public int ViewCount { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }
}