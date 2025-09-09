using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UniSanayi.Infrastructure.Persistence;
using UniSanayi.Domain.Entities;
using UniSanayi.Api.DTOs.Companies;
using UniSanayi.Api.Models;
using UniSanayi.Api.Validators.Companies;

namespace UniSanayi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Company")]
    public class CompaniesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CompaniesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/companies/profile
        [HttpGet("profile")]
        public async Task<ActionResult<CompanyProfileResponse>> GetProfile()
        {
            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(ApiResponse.ErrorResponse("Company profili bulunamadı.", 404));

            var response = new CompanyProfileResponse
            {
                Id = company.Id,
                CompanyName = company.CompanyName,
                Industry = company.Industry,
                CompanySize = company.CompanySize,
                Website = company.Website,
                Description = company.Description,
                ContactPerson = company.ContactPerson,
                ContactPhone = company.ContactPhone,
                ContactEmail = company.ContactEmail,
                LocationCity = company.LocationCity,
                IsVerified = company.IsVerified,
                CreatedAt = company.CreatedAt
            };

            return Ok(ApiResponse<CompanyProfileResponse>.SuccessResponse(response, "Şirket profili başarıyla getirildi."));
        }

        // PUT: api/companies/profile
        [HttpPut("profile")]
        public async Task<ActionResult> UpdateProfile(UpdateCompanyProfileRequest request)
        {
            // Validation
            var validator = new UpdateCompanyProfileRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Profil güncelleme parametreleri geçersiz.", 400, errors));
            }

            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(ApiResponse.ErrorResponse("Company profili bulunamadı.", 404));

            // Güncelleme
            if (request.CompanyName != null) company.CompanyName = request.CompanyName;
            if (request.Industry != null) company.Industry = request.Industry;
            if (request.CompanySize != null) company.CompanySize = request.CompanySize;
            if (request.Website != null) company.Website = request.Website;
            if (request.Description != null) company.Description = request.Description;
            if (request.ContactPerson != null) company.ContactPerson = request.ContactPerson;
            if (request.ContactPhone != null) company.ContactPhone = request.ContactPhone;
            if (request.ContactEmail != null) company.ContactEmail = request.ContactEmail;
            if (request.LocationCity != null) company.LocationCity = request.LocationCity;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResponse("Şirket profili başarıyla güncellendi."));
        }

        // GET: api/companies/projects
        [HttpGet("projects")]
        public async Task<ActionResult<List<CompanyProjectResponse>>> GetProjects([FromQuery] bool summary = false)
        {
            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(ApiResponse.ErrorResponse("Company profili bulunamadı.", 404));

            // Önce tüm projeleri çek
            var allProjects = await _context.Projects
                .Where(p => p.CompanyId == company.Id)
                .OrderByDescending(p => p.UpdatedAt)
                .ToListAsync();

            // Summary ise ilk 3'ünü al
            var projects = summary ? allProjects.Take(3).ToList() : allProjects;

            // Memory'de dönüştür
            var projectResponses = projects.Select(p => new CompanyProjectResponse
            {
                Id = p.Id,
                Title = p.Title,
                Description = summary && !string.IsNullOrEmpty(p.Description) && p.Description.Length > 150 
                    ? p.Description.Substring(0, 150) + "..." 
                    : p.Description,
                ProjectType = p.ProjectType,
                Status = p.Status ?? "Draft",
                DurationDays = p.DurationDays,
                BudgetAmount = p.BudgetAmount,
                Currency = p.Currency,
                LocationCity = p.LocationCity,
                LocationRequirement = p.LocationRequirement,
                MaxApplicants = p.MaxApplicants,
                ApplicationDeadline = p.ApplicationDeadline,
                ProjectStartDate = p.ProjectStartDate,
                ViewCount = p.ViewCount,
                ApplicationsCount = _context.Applications.Count(a => a.ProjectId == p.Id),
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            }).ToList();

            var message = summary ? "Proje özeti başarıyla getirildi." : "Projeler başarıyla listelendi.";
            return Ok(ApiResponse<List<CompanyProjectResponse>>.SuccessResponse(projectResponses, message));
        }

        // GET: api/companies/applications
        [HttpGet("applications")]
        public async Task<ActionResult<List<CompanyApplicationResponse>>> GetApplications([FromQuery] bool recent = false)
        {
            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(ApiResponse.ErrorResponse("Company profili bulunamadı.", 404));

            // Önce tüm başvuruları çek
            var allApplications = await _context.Applications
                .Include(a => a.Project)
                .Include(a => a.Student)
                .ThenInclude(s => s!.User)
                .Where(a => a.Project!.CompanyId == company.Id)
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();

            // Recent ise ilk 5'ini al
            var applications = recent ? allApplications.Take(5).ToList() : allApplications;

            // Memory'de dönüştür
            var applicationResponses = applications.Select(a => new CompanyApplicationResponse
            {
                Id = a.Id,
                ProjectId = a.ProjectId,
                ProjectTitle = a.Project?.Title ?? "",
                StudentId = a.StudentId,
                StudentName = $"{a.Student?.FirstName} {a.Student?.LastName}",
                StudentEmail = a.Student?.User?.Email ?? "",
                StudentUniversity = a.Student?.UniversityName ?? "",
                StudentDepartment = a.Student?.Department ?? "",
                ApplicationStatus = a.ApplicationStatus ?? "Pending",
                CoverLetter = a.CoverLetter ?? "",
                AppliedAt = a.AppliedAt,
                ReviewedAt = a.ReviewedAt
            }).ToList();

            var message = recent ? "Son başvurular başarıyla getirildi." : "Başvurular başarıyla listelendi.";
            return Ok(ApiResponse<List<CompanyApplicationResponse>>.SuccessResponse(applicationResponses, message));
        }

        // GET: api/companies/dashboard-stats
        [HttpGet("dashboard-stats")]
        public async Task<ActionResult<CompanyDashboardStatsResponse>> GetDashboardStats()
        {
            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(ApiResponse.ErrorResponse("Company profili bulunamadı.", 404));

            var totalProjects = await _context.Projects
                .CountAsync(p => p.CompanyId == company.Id);

            var activeProjects = await _context.Projects
                .CountAsync(p => p.CompanyId == company.Id && p.Status == "Active");

            var totalApplications = await _context.Applications
                .Include(a => a.Project)
                .CountAsync(a => a.Project!.CompanyId == company.Id);

            var pendingApplications = await _context.Applications
                .Include(a => a.Project)
                .CountAsync(a => a.Project!.CompanyId == company.Id && a.ApplicationStatus == "Pending");

            var totalViews = await _context.Projects
                .Where(p => p.CompanyId == company.Id)
                .SumAsync(p => p.ViewCount);

            var stats = new CompanyDashboardStatsResponse
            {
                TotalProjects = totalProjects,
                ActiveProjects = activeProjects,
                DraftProjects = await _context.Projects.CountAsync(p => p.CompanyId == company.Id && p.Status == "Draft"),
                ClosedProjects = await _context.Projects.CountAsync(p => p.CompanyId == company.Id && p.Status == "Closed"),
                TotalApplications = totalApplications,
                PendingApplications = pendingApplications,
                ReviewedApplications = await _context.Applications
                    .Include(a => a.Project)
                    .CountAsync(a => a.Project!.CompanyId == company.Id && a.ApplicationStatus == "Reviewed"),
                AcceptedApplications = await _context.Applications
                    .Include(a => a.Project)
                    .CountAsync(a => a.Project!.CompanyId == company.Id && a.ApplicationStatus == "Accepted"),
                RejectedApplications = await _context.Applications
                    .Include(a => a.Project)
                    .CountAsync(a => a.Project!.CompanyId == company.Id && a.ApplicationStatus == "Rejected"),
                TotalViews = totalViews,
                AvgApplicationsPerProject = totalProjects > 0 ? Math.Round((double)totalApplications / totalProjects, 1) : 0
            };

            return Ok(ApiResponse<CompanyDashboardStatsResponse>.SuccessResponse(stats, "Dashboard istatistikleri başarıyla getirildi."));
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim!);
        }
    }
}