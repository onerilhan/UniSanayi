namespace UniSanayi.Api.DTOs.Applications
{
    public class ApplicationDetailResponse
    {
        public Guid Id { get; set; }
        
        // Project bilgileri
        public Guid ProjectId { get; set; }
        public string ProjectTitle { get; set; } = default!;
        public string ProjectType { get; set; } = default!;
        public string CompanyName { get; set; } = default!;
        
        // Student bilgileri
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = default!;
        public string StudentEmail { get; set; } = default!;
        public string UniversityName { get; set; } = default!;
        public string Department { get; set; } = default!;
        public int? CurrentYear { get; set; }
        public int? GraduationYear { get; set; }
        public decimal? Gpa { get; set; }
        
        // Application bilgileri
        public string? CoverLetter { get; set; }
        public string? ApplicationStatus { get; set; }
        public DateTimeOffset AppliedAt { get; set; }
        public DateTimeOffset? ReviewedAt { get; set; }
    }
}