namespace UniSanayi.Api.DTOs.Auth
{
    public class StudentRegisterRequest
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string FirstName { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public string UniversityName { get; set; } = default!;
        public string Department { get; set; } = default!;
        public int? CurrentYear { get; set; }
        public int? GraduationYear { get; set; }
    }
}