namespace UniSanayi.Api.DTOs.Applications
{
    public class UpdateApplicationStatusRequest
    {
        public string Status { get; set; } = default!; // Pending, Reviewed, Accepted, Rejected
    }
}
