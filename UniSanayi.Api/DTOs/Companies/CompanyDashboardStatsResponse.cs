namespace UniSanayi.Api.DTOs.Companies
{
    public class CompanyDashboardStatsResponse
    {
        public int TotalProjects { get; set; }
        public int ActiveProjects { get; set; }
        public int DraftProjects { get; set; }
        public int ClosedProjects { get; set; }
        public int TotalApplications { get; set; }
        public int PendingApplications { get; set; }
        public int ReviewedApplications { get; set; }
        public int AcceptedApplications { get; set; }
        public int RejectedApplications { get; set; }
        public int TotalViews { get; set; }
        public double AvgApplicationsPerProject { get; set; }
    }
}