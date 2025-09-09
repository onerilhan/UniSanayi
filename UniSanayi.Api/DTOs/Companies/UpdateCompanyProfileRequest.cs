namespace UniSanayi.Api.DTOs.Companies
{
    public class UpdateCompanyProfileRequest
    {
        public string? CompanyName { get; set; }
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
        public string? Website { get; set; }
        public string? Description { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public string? LocationCity { get; set; }
    }
}