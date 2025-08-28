namespace UniSanayi.Api.DTOs.Applications
{
    public class MyApplicationResponse
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string ProjectTitle { get; set; } = default!;
        public string ProjectType { get; set; } = default!;
        public string CompanyName { get; set; } = default!;
        public string? ApplicationStatus { get; set; }
        public DateTimeOffset AppliedAt { get; set; }
        public DateTimeOffset? ReviewedAt { get; set; }
    }
}