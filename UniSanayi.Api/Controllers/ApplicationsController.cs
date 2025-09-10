using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UniSanayi.Infrastructure.Persistence;
using UniSanayi.Domain.Entities;
using UniSanayi.Api.DTOs.Applications;
using UniSanayi.Api.Models;
using UniSanayi.Api.Validators.Applications;

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
            // Validation
            var validator = new CreateApplicationRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Başvuru parametreleri geçersiz.", 400, errors));
            }

            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(ApiResponse.ErrorResponse("Student profili bulunamadı.", 404));

            // Proje var mı ve aktif mi kontrol et
            var project = await _context.Projects
                .Include(p => p.Company)
                .FirstOrDefaultAsync(p => p.Id == request.ProjectId);

            if (project == null)
                return NotFound(ApiResponse.ErrorResponse("Proje bulunamadı.", 404));

            if (project.Status != "Active")
                return BadRequest(ApiResponse.ErrorResponse("Bu proje aktif değil.", 400));

            // Application deadline kontrolü
            if (project.ApplicationDeadline.HasValue && project.ApplicationDeadline < DateTimeOffset.UtcNow)
                return BadRequest(ApiResponse.ErrorResponse("Başvuru süresi dolmuş.", 400));

            // Zaten başvuru yapmış mı kontrol et
            var existingApplication = await _context.Applications
                .FirstOrDefaultAsync(a => a.ProjectId == request.ProjectId && a.StudentId == student.Id);

            if (existingApplication != null)
                return BadRequest(ApiResponse.ErrorResponse("Bu projeye zaten başvuru yaptınız.", 400));

            // Max başvuru sayısı kontrolü
            if (project.MaxApplicants.HasValue)
            {
                var currentApplicationCount = await _context.Applications
                    .CountAsync(a => a.ProjectId == request.ProjectId);

                if (currentApplicationCount >= project.MaxApplicants)
                    return BadRequest(ApiResponse.ErrorResponse("Bu proje için başvuru kotası dolmuş.", 400));
            }

            // Student profili tamamlanmış mı kontrolü (iş kuralı)
            if (string.IsNullOrEmpty(student.Phone) || string.IsNullOrEmpty(student.LocationCity) || 
                !student.GraduationYear.HasValue)
            {
                return BadRequest(ApiResponse.ErrorResponse("Başvuru yapabilmek için profilinizi tamamlayınız (telefon, şehir, mezuniyet yılı).", 400));
            }

            // Student müsait mi kontrolü
            if (!student.IsAvailable)
            {
                return BadRequest(ApiResponse.ErrorResponse("Profiliniz şu anda müsait değil olarak işaretli. Başvuru yapmak için profilinizi müsait olarak güncelleyiniz.", 400));
            }

            // Aynı şirkete aynı anda kaç başvuru yapıyor kontrolü (spam önlemi)
            var recentApplicationsToSameCompany = await _context.Applications
                .Include(a => a.Project)
                .Where(a => a.StudentId == student.Id && 
                           a.Project!.CompanyId == project.CompanyId &&
                           a.AppliedAt >= DateTimeOffset.UtcNow.AddDays(-7))
                .CountAsync();

            if (recentApplicationsToSameCompany >= 3)
            {
                return BadRequest(ApiResponse.ErrorResponse("Son 7 gün içinde bu şirkete 3'ten fazla başvuru yapamazsınız.", 400));
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

            var responseData = new { 
                applicationId = application.Id,
                projectTitle = project.Title,
                companyName = project.Company!.CompanyName
            };

            return Created($"/api/applications/{application.Id}", 
                ApiResponse<object>.SuccessResponse(responseData, "Başvuru başarıyla gönderildi."));
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
                return NotFound(ApiResponse.ErrorResponse("Student profili bulunamadı.", 404));

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

            return Ok(ApiResponse<List<MyApplicationResponse>>.SuccessResponse(applications, "Başvurularınız başarıyla listelendi."));
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
                return NotFound(ApiResponse.ErrorResponse("Company profili bulunamadı.", 404));

            // Proje bu şirkete ait mi kontrol et
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.CompanyId == company.Id);

            if (project == null)
                return NotFound(ApiResponse.ErrorResponse("Proje bulunamadı veya yetkiniz yok.", 404));

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

            return Ok(ApiResponse<List<ProjectApplicationResponse>>.SuccessResponse(applications, "Proje başvuruları başarıyla listelendi."));
        }


                // PUT: api/applications/{id}/status (Company - başvuru durumunu güncelle)
                [HttpPut("{id}/status")]
                [Authorize(Roles = "Company")]
                public async Task<ActionResult> UpdateApplicationStatus(Guid id, UpdateApplicationStatusRequest request)
                {
                    // Validation
                    var validator = new UpdateApplicationStatusRequestValidator();
                    var validationResult = await validator.ValidateAsync(request);
                    if (!validationResult.IsValid)
                    {
                        var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                        return BadRequest(ApiResponse.ErrorResponse("Durum güncelleme parametreleri geçersiz.", 400, errors));
                    }

                    var userId = GetCurrentUserId();
                    var company = await _context.Companies
                        .FirstOrDefaultAsync(c => c.UserId == userId);

                    if (company == null)
                        return NotFound(ApiResponse.ErrorResponse("Company profili bulunamadı.", 404));

                    var application = await _context.Applications
                        .Include(a => a.Project)
                        .Include(a => a.Student)
                        .FirstOrDefaultAsync(a => a.Id == id);

                    if (application == null)
                        return NotFound(ApiResponse.ErrorResponse("Başvuru bulunamadı.", 404));

                    // Başvuru bu şirketin projesine mi kontrol et
                    if (application.Project!.CompanyId != company.Id)
                        return StatusCode(403, ApiResponse<object>.ErrorResponse("Bu başvuruyu görüntüleme yetkiniz yok.", 403));

                    // BUSINESS LOGIC
                    var currentStatus = application.ApplicationStatus;
                    var newStatus = request.Status;

                    // 1. Final state'lerden değişiklik yapılamaz
                    if (currentStatus == "Accepted" || currentStatus == "Rejected")
                    {
                        return BadRequest(ApiResponse.ErrorResponse("Kabul edilmiş veya reddedilmiş başvuruların durumu tekrar değiştirilemez.", 400));
                    }

                    if (currentStatus == "Pending" && newStatus == "Accepted")
                    {
                        return BadRequest(ApiResponse.ErrorResponse("Başvuruyu kabul etmeden önce 'Reviewed' (İncelendi) durumuna almalısınız.", 400));
                    }

                    if (currentStatus == "Pending" && newStatus == "Rejected")
                    {
                        return BadRequest(ApiResponse.ErrorResponse("Başvuruyu reddetmeden önce 'Reviewed' (İncelendi) durumuna almalısınız.", 400));
                    }

                    var validTransitions = new Dictionary<string, List<string>>
                    {
                        { "Pending", new List<string> { "Reviewed" } },
                        { "Reviewed", new List<string> { "Accepted", "Rejected", "Pending" } }
                    };

                    if (string.IsNullOrEmpty(currentStatus) || 
                        string.IsNullOrEmpty(newStatus) ||
                        !validTransitions.ContainsKey(currentStatus) || 
                        !validTransitions[currentStatus].Contains(newStatus))
                    {
                        return BadRequest(ApiResponse.ErrorResponse("Geçersiz durum bilgisi.", 400));
                    }

                    // 5. Aynı proje için aynı anda birden fazla Accepted başvuru kontrolü
                    if (newStatus == "Accepted")
                    {
                        var existingAcceptedCount = await _context.Applications
                            .CountAsync(a => a.ProjectId == application.ProjectId && 
                                            a.ApplicationStatus == "Accepted" && 
                                            a.Id != id);

                        var maxAccepted = application.Project.MaxApplicants ?? 1;
                        
                        if (existingAcceptedCount >= maxAccepted)
                        {
                            return BadRequest(ApiResponse.ErrorResponse($"Bu proje için maksimum {maxAccepted} başvuru kabul edilebilir.", 400));
                        }
                    }

                    // Güncelleme yap
                    application.ApplicationStatus = request.Status;
                    application.ReviewedAt = DateTimeOffset.UtcNow;

                    await _context.SaveChangesAsync();

                    var responseData = new { 
                        applicationId = application.Id,
                        studentName = $"{application.Student!.FirstName} {application.Student.LastName}",
                        newStatus = request.Status
                    };

                    return Ok(ApiResponse<object>.SuccessResponse(responseData, "Başvuru durumu başarıyla güncellendi."));
                }

            // Helper method - Status display name
            private string GetStatusDisplayName(string status)
            {
                return status switch
                {
                    "Pending" => "Bekliyor",
                    "Reviewed" => "İncelendi", 
                    "Accepted" => "Kabul Edildi",
                    "Rejected" => "Reddedildi",
                    _ => status
                };
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
                    return NotFound(ApiResponse.ErrorResponse("Student profili bulunamadı.", 404));

                var application = await _context.Applications
                    .Include(a => a.Project)
                    .FirstOrDefaultAsync(a => a.Id == id && a.StudentId == student.Id);

                if (application == null)
                    return NotFound(ApiResponse.ErrorResponse("Başvuru bulunamadı.", 404));

                // Sadece Pending durumundaki başvurular iptal edilebilir
                if (application.ApplicationStatus != "Pending")
                    return BadRequest(ApiResponse.ErrorResponse("Bu başvuru artık iptal edilemez.", 400));

                // Başvuru tarihi 24 saat geçmişse iptal edilemez (iş kuralı)
                if (application.AppliedAt < DateTimeOffset.UtcNow.AddHours(-24))
                {
                    return BadRequest(ApiResponse.ErrorResponse("24 saat geçen başvurular iptal edilemez.", 400));
                }

                _context.Applications.Remove(application);
                await _context.SaveChangesAsync();

                var responseData = new { 
                    projectTitle = application.Project!.Title 
                };

                return Ok(ApiResponse<object>.SuccessResponse(responseData, "Başvuru başarıyla iptal edildi."));
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
                return NotFound(ApiResponse<ApplicationDetailResponse>.ErrorResponse("Başvuru bulunamadı.", 404));

            // Yetki kontrolü
            if (userRole == "Student")
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (student == null || application.StudentId != student.Id)
                    return StatusCode(403, ApiResponse<ApplicationDetailResponse>.ErrorResponse("Bu başvuruyu görüntüleme yetkiniz yok.", 403));
            }
            else if (userRole == "Company")
            {
                var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
                if (company == null || application.Project!.CompanyId != company.Id)
                    return StatusCode(403, ApiResponse<ApplicationDetailResponse>.ErrorResponse("Bu başvuruyu görüntüleme yetkiniz yok.", 403));
            }
            else
            {
                return StatusCode(403, ApiResponse<ApplicationDetailResponse>.ErrorResponse("Yetkiniz bulunmuyor.", 403));
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

            return Ok(ApiResponse<ApplicationDetailResponse>.SuccessResponse(response, "Başvuru detayı başarıyla getirildi."));
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim!);
        }
    }
}