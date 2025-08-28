namespace UniSanayi.Api.DTOs.Auth
{
    public class CompanyRegisterRequest
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string CompanyName { get; set; } = default!;
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
        public string? Website { get; set; }
        public string? Description { get; set; }
        public string ContactPerson { get; set; } = default!;
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public string? LocationCity { get; set; }
    }
}