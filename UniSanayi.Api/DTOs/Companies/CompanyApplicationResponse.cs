namespace UniSanayi.Api.DTOs.Companies
{
    public class CompanyApplicationResponse
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string ProjectTitle { get; set; } = string.Empty;
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;
        public string StudentUniversity { get; set; } = string.Empty;
        public string StudentDepartment { get; set; } = string.Empty;
        public string ApplicationStatus { get; set; } = string.Empty;
        public string CoverLetter { get; set; } = string.Empty;
        public DateTimeOffset AppliedAt { get; set; }
        public DateTimeOffset? ReviewedAt { get; set; }
    }
}
