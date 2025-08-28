namespace UniSanayi.Api.DTOs.Projects
{
    public class ProjectFilterRequest
    {
        public string? LocationCity { get; set; }
        public string? ProjectType { get; set; }
        public string? LocationRequirement { get; set; } // Remote, On-site, Hybrid
        public decimal? MinBudget { get; set; }
        public decimal? MaxBudget { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
