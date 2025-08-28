namespace UniSanayi.Api.DTOs.Applications
{
    public class CreateApplicationRequest
    {
        public Guid ProjectId { get; set; }
        public string? CoverLetter { get; set; }
    }
}