using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UniSanayi.Infrastructure.Persistence;
using UniSanayi.Domain.Entities;
using UniSanayi.Api.DTOs.Applications;

namespace UniSanayi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ApplicationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ApplicationsController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/applications (Student - projeye başvur)
        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult> ApplyToProject(CreateApplicationRequest request)
        {
            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new { message = "Student profili bulunamadı." });

            // Proje var mı ve aktif mi kontrol et
            var project = await _context.Projects
                .Include(p => p.Company)
                .FirstOrDefaultAsync(p => p.Id == request.ProjectId);

            if (project == null)
                return NotFound(new { message = "Proje bulunamadı." });

            if (project.Status != "Active")
                return BadRequest(new { message = "Bu proje aktif değil." });

            // Application deadline kontrolü
            if (project.ApplicationDeadline.HasValue && project.ApplicationDeadline < DateTimeOffset.UtcNow)
                return BadRequest(new { message = "Başvuru süresi dolmuş." });

            // Zaten başvuru yapmış mı kontrol et
            var existingApplication = await _context.Applications
                .FirstOrDefaultAsync(a => a.ProjectId == request.ProjectId && a.StudentId == student.Id);

            if (existingApplication != null)
                return BadRequest(new { message = "Bu projeye zaten başvuru yaptınız." });

            // Max başvuru sayısı kontrolü
            if (project.MaxApplicants.HasValue)
            {
                var currentApplicationCount = await _context.Applications
                    .CountAsync(a => a.ProjectId == request.ProjectId);

                if (currentApplicationCount >= project.MaxApplicants)
                    return BadRequest(new { message = "Bu proje için başvuru kotası dolmuş." });
            }

            var application = new Application
            {
                Id = Guid.NewGuid(),
                ProjectId = request.ProjectId,
                StudentId = student.Id,
                CoverLetter = request.CoverLetter,
                ApplicationStatus = "Pending",
                AppliedAt = DateTimeOffset.UtcNow
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            return Created($"/api/applications/{application.Id}", new { 
                message = "Başvuru başarıyla gönderildi.",
                applicationId = application.Id
            });
        }

        // GET: api/applications/my (Student - kendi başvuruları)
        [HttpGet("my")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<List<MyApplicationResponse>>> GetMyApplications()
        {
            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new { message = "Student profili bulunamadı." });

            var applications = await _context.Applications
                .Include(a => a.Project)
                .ThenInclude(p => p!.Company)
                .Where(a => a.StudentId == student.Id)
                .OrderByDescending(a => a.AppliedAt)
                .Select(a => new MyApplicationResponse
                {
                    Id = a.Id,
                    ProjectId = a.ProjectId,
                    ProjectTitle = a.Project!.Title,
                    ProjectType = a.Project.ProjectType,
                    CompanyName = a.Project.Company!.CompanyName,
                    ApplicationStatus = a.ApplicationStatus,
                    AppliedAt = a.AppliedAt,
                    ReviewedAt = a.ReviewedAt
                })
                .ToListAsync();

            return Ok(applications);
        }

        // GET: api/applications/project/{projectId} (Company - proje başvurularını görüntüle)
        [HttpGet("project/{projectId}")]
        [Authorize(Roles = "Company")]
        public async Task<ActionResult<List<ProjectApplicationResponse>>> GetProjectApplications(Guid projectId)
        {
            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(new { message = "Company profili bulunamadı." });

            // Proje bu şirkete ait mi kontrol et
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.CompanyId == company.Id);

            if (project == null)
                return NotFound(new { message = "Proje bulunamadı veya yetkiniz yok." });

            var applications = await _context.Applications
                .Include(a => a.Student)
                .ThenInclude(s => s!.User)
                .Where(a => a.ProjectId == projectId)
                .OrderByDescending(a => a.AppliedAt)
                .Select(a => new ProjectApplicationResponse
                {
                    Id = a.Id,
                    StudentId = a.StudentId,
                    StudentName = $"{a.Student!.FirstName} {a.Student.LastName}",
                    StudentEmail = a.Student.User!.Email,
                    UniversityName = a.Student.UniversityName,
                    Department = a.Student.Department,
                    CurrentYear = a.Student.CurrentYear,
                    GraduationYear = a.Student.GraduationYear,
                    Gpa = a.Student.Gpa,
                    CoverLetter = a.CoverLetter,
                    ApplicationStatus = a.ApplicationStatus,
                    AppliedAt = a.AppliedAt,
                    ReviewedAt = a.ReviewedAt
                })
                .ToListAsync();

            return Ok(applications);
        }

        // PUT: api/applications/{id}/status (Company - başvuru durumunu güncelle)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Company")]
        public async Task<ActionResult> UpdateApplicationStatus(Guid id, UpdateApplicationStatusRequest request)
        {
            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(new { message = "Company profili bulunamadı." });

            var application = await _context.Applications
                .Include(a => a.Project)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
                return NotFound(new { message = "Başvuru bulunamadı." });

            // Başvuru bu şirketin projesine mi kontrol et
            if (application.Project!.CompanyId != company.Id)
                return NotFound(new { message = "Bu başvuruyu görüntüleme yetkiniz yok." });

            // Geçerli status değerleri kontrolü
            var validStatuses = new[] { "Pending", "Reviewed", "Accepted", "Rejected" };
            if (!validStatuses.Contains(request.Status))
                return BadRequest(new { message = "Geçersiz başvuru durumu." });

            application.ApplicationStatus = request.Status;
            application.ReviewedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Başvuru durumu başarıyla güncellendi." });
        }

        // GET: api/applications/{id} (Both - başvuru detayı)
        [HttpGet("{id}")]
        public async Task<ActionResult<ApplicationDetailResponse>> GetApplication(Guid id)
        {
            var userId = GetCurrentUserId();
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var application = await _context.Applications
                .Include(a => a.Project)
                .ThenInclude(p => p!.Company)
                .Include(a => a.Student)
                .ThenInclude(s => s!.User)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
                return NotFound(new { message = "Başvuru bulunamadı." });

            // Yetki kontrolü
            if (userRole == "Student")
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (student == null || application.StudentId != student.Id)
                    return NotFound(new { message = "Bu başvuruyu görüntüleme yetkiniz yok." });
            }
            else if (userRole == "Company")
            {
                var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
                if (company == null || application.Project!.CompanyId != company.Id)
                    return NotFound(new { message = "Bu başvuruyu görüntüleme yetkiniz yok." });
            }
            else
            {
                return Forbid();
            }

            var response = new ApplicationDetailResponse
            {
                Id = application.Id,
                ProjectId = application.ProjectId,
                ProjectTitle = application.Project!.Title,
                ProjectType = application.Project.ProjectType,
                CompanyName = application.Project.Company!.CompanyName,
                StudentId = application.StudentId,
                StudentName = $"{application.Student!.FirstName} {application.Student.LastName}",
                StudentEmail = application.Student.User!.Email,
                UniversityName = application.Student.UniversityName,
                Department = application.Student.Department,
                CurrentYear = application.Student.CurrentYear,
                GraduationYear = application.Student.GraduationYear,
                Gpa = application.Student.Gpa,
                CoverLetter = application.CoverLetter,
                ApplicationStatus = application.ApplicationStatus,
                AppliedAt = application.AppliedAt,
                ReviewedAt = application.ReviewedAt
            };

            return Ok(response);
        }

        // DELETE: api/applications/{id} (Student - başvuruyu iptal et)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult> CancelApplication(Guid id)
        {
            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new { message = "Student profili bulunamadı." });

            var application = await _context.Applications
                .FirstOrDefaultAsync(a => a.Id == id && a.StudentId == student.Id);

            if (application == null)
                return NotFound(new { message = "Başvuru bulunamadı." });

            // Sadece Pending durumundaki başvurular iptal edilebilir
            if (application.ApplicationStatus != "Pending")
                return BadRequest(new { message = "Bu başvuru artık iptal edilemez." });

            _context.Applications.Remove(application);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Başvuru başarıyla iptal edildi." });
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim!);
        }
    }
}