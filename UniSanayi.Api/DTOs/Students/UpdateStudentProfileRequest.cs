namespace UniSanayi.Api.DTOs.Students
{
    public class UpdateStudentProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? StudentNumber { get; set; }
        public string? UniversityName { get; set; }
        public string? Department { get; set; }
        public int? CurrentYear { get; set; }
        public int? GraduationYear { get; set; }
        public decimal? Gpa { get; set; }
        public string? Phone { get; set; }
        public string? LocationCity { get; set; }
        public string? Bio { get; set; }
        public string? LinkedinUrl { get; set; }
        public string? GithubUrl { get; set; }
        public bool? IsAvailable { get; set; }
    }
}