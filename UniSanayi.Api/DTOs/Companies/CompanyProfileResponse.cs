namespace UniSanayi.Api.DTOs.Companies
{
    public class CompanyProfileResponse
    {
        public Guid Id { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
        public string? Website { get; set; }
        public string? Description { get; set; }
        public string ContactPerson { get; set; } = string.Empty;
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public string? LocationCity { get; set; }
        public bool IsVerified { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}