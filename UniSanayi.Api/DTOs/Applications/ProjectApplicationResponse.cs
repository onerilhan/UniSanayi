namespace UniSanayi.Api.DTOs.Applications
{
    public class ProjectApplicationResponse
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = default!;
        public string StudentEmail { get; set; } = default!;
        public string UniversityName { get; set; } = default!;
        public string Department { get; set; } = default!;
        public int? CurrentYear { get; set; }
        public int? GraduationYear { get; set; }
        public decimal? Gpa { get; set; }
        public string? CoverLetter { get; set; }
        public string? ApplicationStatus { get; set; }
        public DateTimeOffset AppliedAt { get; set; }
        public DateTimeOffset? ReviewedAt { get; set; }
    }
}