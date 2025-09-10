namespace UniSanayi.Api.DTOs.Auth
{
    public class GoogleLoginRequest
    {
        public string GoogleToken { get; set; } = default!;
        public string UserType { get; set; } = default!; // "Student" or "Company"
        
        // Sadece Student kaydı için gerekli
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? UniversityName { get; set; }
        public string? Department { get; set; }
        public int? CurrentYear { get; set; }
        public int? GraduationYear { get; set; }
        
        // Sadece Company kaydı için gerekli
        public string? CompanyName { get; set; }
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
        public string? ContactPerson { get; set; }
    }
}
