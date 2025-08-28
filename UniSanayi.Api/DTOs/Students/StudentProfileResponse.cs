namespace UniSanayi.Api.DTOs.Students
{
    public class StudentProfileResponse
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public string? StudentNumber { get; set; }
        public string UniversityName { get; set; } = default!;
        public string Department { get; set; } = default!;
        public int? CurrentYear { get; set; }
        public int? GraduationYear { get; set; }
        public decimal? Gpa { get; set; }
        public string? Phone { get; set; }
        public string? LocationCity { get; set; }
        public string? Bio { get; set; }
        public string? LinkedinUrl { get; set; }
        public string? GithubUrl { get; set; }
        public bool IsAvailable { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}