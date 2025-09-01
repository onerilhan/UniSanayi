using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UniSanayi.Infrastructure.Persistence;
using UniSanayi.Domain.Entities;
using UniSanayi.Api.DTOs.Projects;
using UniSanayi.Api.Models;
using UniSanayi.Api.Validators.Projects;

namespace UniSanayi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/projects (Public - tüm aktif projeler)
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<ProjectListResponse>>> GetActiveProjects([FromQuery] ProjectFilterRequest request)
        {
            // Validation
            var validator = new ProjectFilterRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Filtreleme parametreleri geçersiz.", 400, errors));
            }

            var query = _context.Projects
                .Include(p => p.Company)
                .Where(p => p.Status == "Active");

            // Filtreleme
            if (!string.IsNullOrEmpty(request.LocationCity))
                query = query.Where(p => p.LocationCity == request.LocationCity);

            if (!string.IsNullOrEmpty(request.ProjectType))
                query = query.Where(p => p.ProjectType == request.ProjectType);

            if (!string.IsNullOrEmpty(request.LocationRequirement))
                query = query.Where(p => p.LocationRequirement == request.LocationRequirement);

            if (request.MinBudget.HasValue)
                query = query.Where(p => p.BudgetAmount >= request.MinBudget);

            if (request.MaxBudget.HasValue)
                query = query.Where(p => p.BudgetAmount <= request.MaxBudget);

            // Sayfalama
            var totalCount = await query.CountAsync();
            var projects = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(p => new ProjectListResponse
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description.Length > 200 ? p.Description.Substring(0, 200) + "..." : p.Description,
                    ProjectType = p.ProjectType,
                    DurationDays = p.DurationDays,
                    BudgetAmount = p.BudgetAmount,
                    Currency = p.Currency,
                    LocationCity = p.LocationCity,
                    LocationRequirement = p.LocationRequirement,
                    ApplicationDeadline = p.ApplicationDeadline,
                    CompanyName = p.Company!.CompanyName,
                    CompanyIndustry = p.Company.Industry,
                    ViewCount = p.ViewCount,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            var responseData = new { projects, totalCount, page = request.Page, pageSize = request.PageSize };
            return Ok(ApiResponse<object>.SuccessResponse(responseData, "Projeler başarıyla listelendi."));
        }

        // GET: api/projects/{id} (Public - proje detayı)
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProjectDetailResponse>> GetProject(Guid id)
        {
            var project = await _context.Projects
                .Include(p => p.Company)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
                return NotFound(ApiResponse.ErrorResponse("Proje bulunamadı.", 404));

            // View count artır
            project.ViewCount++;
            await _context.SaveChangesAsync();

            // Skill requirements getir
            var skillRequirements = await _context.ProjectSkillRequirements
                .Include(psr => psr.Skill)
                .Where(psr => psr.ProjectId == id)
                .Select(psr => new ProjectSkillRequirementResponse
                {
                    SkillId = psr.SkillId,
                    SkillName = psr.Skill!.Name,
                    SkillCategory = psr.Skill.Category,
                    RequiredLevel = psr.RequiredLevel,
                    IsMandatory = psr.IsMandatory,
                    WeightPercentage = psr.WeightPercentage
                })
                .ToListAsync();

            var response = new ProjectDetailResponse
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                ProjectType = project.ProjectType,
                DurationDays = project.DurationDays,
                BudgetAmount = project.BudgetAmount,
                Currency = project.Currency,
                LocationCity = project.LocationCity,
                LocationRequirement = project.LocationRequirement,
                MaxApplicants = project.MaxApplicants,
                ApplicationDeadline = project.ApplicationDeadline,
                ProjectStartDate = project.ProjectStartDate,
                Status = project.Status,
                ViewCount = project.ViewCount,
                CompanyName = project.Company!.CompanyName,
                CompanyIndustry = project.Company.Industry,
                CompanyDescription = project.Company.Description,
                CompanyWebsite = project.Company.Website,
                CompanyLocationCity = project.Company.LocationCity,
                SkillRequirements = skillRequirements,
                CreatedAt = project.CreatedAt,
                UpdatedAt = project.UpdatedAt
            };

            return Ok(ApiResponse<ProjectDetailResponse>.SuccessResponse(response, "Proje detayı başarıyla getirildi."));
        }

        // GET: api/projects/my (Company - kendi projeleri)
        [HttpGet("my")]
        [Authorize(Roles = "Company")]
        public async Task<ActionResult<List<MyProjectResponse>>> GetMyProjects()
        {
            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(ApiResponse.ErrorResponse("Company profili bulunamadı.", 404));

            var projects = await _context.Projects
                .Where(p => p.CompanyId == company.Id)
                .OrderByDescending(p => p.UpdatedAt)
                .Select(p => new MyProjectResponse
                {
                    Id = p.Id,
                    Title = p.Title,
                    ProjectType = p.ProjectType,
                    Status = p.Status,
                    DurationDays = p.DurationDays,
                    BudgetAmount = p.BudgetAmount,
                    Currency = p.Currency,
                    ApplicationDeadline = p.ApplicationDeadline,
                    ViewCount = p.ViewCount,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                })
                .ToListAsync();

            return Ok(ApiResponse<List<MyProjectResponse>>.SuccessResponse(projects, "Projeleriniz başarıyla listelendi."));
        }

        // POST: api/projects (Company - yeni proje)
        [HttpPost]
        [Authorize(Roles = "Company")]
        public async Task<ActionResult> CreateProject(CreateProjectRequest request)
        {
            // Validation
            var validator = new CreateProjectRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Proje oluşturma parametreleri geçersiz.", 400, errors));
            }

            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(ApiResponse.ErrorResponse("Company profili bulunamadı.", 404));

            var project = new Project
            {
                Id = Guid.NewGuid(),
                CompanyId = company.Id,
                Title = request.Title,
                Description = request.Description,
                ProjectType = request.ProjectType,
                DurationDays = request.DurationDays,
                BudgetAmount = request.BudgetAmount,
                Currency = request.Currency ?? "TRY",
                LocationCity = request.LocationCity,
                LocationRequirement = request.LocationRequirement ?? "Remote",
                MaxApplicants = request.MaxApplicants ?? 30,
                ApplicationDeadline = request.ApplicationDeadline,
                ProjectStartDate = request.ProjectStartDate,
                Status = "Draft", // Yeni projeler Draft olarak başlar
                ViewCount = 0,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var responseData = new { projectId = project.Id };
            return Created($"/api/projects/{project.Id}", 
                ApiResponse<object>.SuccessResponse(responseData, "Proje başarıyla oluşturuldu."));
        }

        // PUT: api/projects/{id} (Company - proje güncelle)
        [HttpPut("{id}")]
        [Authorize(Roles = "Company")]
        public async Task<ActionResult> UpdateProject(Guid id, UpdateProjectRequest request)
        {
            // Validation
            var validator = new UpdateProjectRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Proje güncelleme parametreleri geçersiz.", 400, errors));
            }

            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(ApiResponse.ErrorResponse("Company profili bulunamadı.", 404));

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == company.Id);

            if (project == null)
                return NotFound(ApiResponse.ErrorResponse("Proje bulunamadı veya yetkiniz yok.", 404));

            // Business Logic: Active durumundaki projelerde kritik alanlar değiştirilemez
            if (project.Status == "Active")
            {
                if (request.ProjectType != null && request.ProjectType != project.ProjectType)
                {
                    return BadRequest(ApiResponse.ErrorResponse("Aktif projelerde proje türü değiştirilemez.", 400));
                }
                if (request.DurationDays.HasValue && request.DurationDays != project.DurationDays)
                {
                    return BadRequest(ApiResponse.ErrorResponse("Aktif projelerde proje süresi değiştirilemez.", 400));
                }
            }

            // Güncelleme
            if (request.Title != null) project.Title = request.Title;
            if (request.Description != null) project.Description = request.Description;
            if (request.ProjectType != null) project.ProjectType = request.ProjectType;
            if (request.DurationDays.HasValue) project.DurationDays = request.DurationDays.Value;
            if (request.BudgetAmount.HasValue) project.BudgetAmount = request.BudgetAmount;
            if (request.Currency != null) project.Currency = request.Currency;
            if (request.LocationCity != null) project.LocationCity = request.LocationCity;
            if (request.LocationRequirement != null) project.LocationRequirement = request.LocationRequirement;
            if (request.MaxApplicants.HasValue) project.MaxApplicants = request.MaxApplicants;
            if (request.ApplicationDeadline.HasValue) project.ApplicationDeadline = request.ApplicationDeadline;
            if (request.ProjectStartDate.HasValue) project.ProjectStartDate = request.ProjectStartDate;
            if (request.Status != null) project.Status = request.Status;

            project.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResponse("Proje başarıyla güncellendi."));
        }

        // POST: api/projects/{id}/skills (Company - skill requirement ekle)
        [HttpPost("{id}/skills")]
        [Authorize(Roles = "Company")]
        public async Task<ActionResult> AddSkillRequirement(Guid id, AddSkillRequirementRequest request)
        {
            // Validation
            var validator = new AddSkillRequirementRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Skill gereksinimi parametreleri geçersiz.", 400, errors));
            }

            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(ApiResponse.ErrorResponse("Company profili bulunamadı.", 404));

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == company.Id);

            if (project == null)
                return NotFound(ApiResponse.ErrorResponse("Proje bulunamadı veya yetkiniz yok.", 404));

            // Skill var mı kontrol et
            var skill = await _context.Skills.FindAsync(request.SkillId);
            if (skill == null || !skill.IsActive)
                return BadRequest(ApiResponse.ErrorResponse("Geçersiz veya pasif skill.", 400));

            // Zaten ekli mi kontrol et
            var existing = await _context.ProjectSkillRequirements
                .FirstOrDefaultAsync(psr => psr.ProjectId == id && psr.SkillId == request.SkillId);

            if (existing != null)
                return BadRequest(ApiResponse.ErrorResponse("Bu skill gereksinimi zaten ekli.", 400));

            var skillRequirement = new ProjectSkillRequirement
            {
                Id = Guid.NewGuid(),
                ProjectId = id,
                SkillId = request.SkillId,
                RequiredLevel = request.RequiredLevel,
                IsMandatory = request.IsMandatory ?? true,
                WeightPercentage = request.WeightPercentage ?? 10
            };

            _context.ProjectSkillRequirements.Add(skillRequirement);
            project.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResponse("Skill gereksinimi başarıyla eklendi."));
        }

        // DELETE: api/projects/{id}/skills/{skillId} (Company - skill requirement sil)
        [HttpDelete("{id}/skills/{skillId}")]
        [Authorize(Roles = "Company")]
        public async Task<ActionResult> RemoveSkillRequirement(Guid id, int skillId)
        {
            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(ApiResponse.ErrorResponse("Company profili bulunamadı.", 404));

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == company.Id);

            if (project == null)
                return NotFound(ApiResponse.ErrorResponse("Proje bulunamadı veya yetkiniz yok.", 404));

            var skillRequirement = await _context.ProjectSkillRequirements
                .FirstOrDefaultAsync(psr => psr.ProjectId == id && psr.SkillId == skillId);

            if (skillRequirement == null)
                return NotFound(ApiResponse.ErrorResponse("Skill gereksinimi bulunamadı.", 404));

            _context.ProjectSkillRequirements.Remove(skillRequirement);
            project.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResponse("Skill gereksinimi başarıyla silindi."));
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim!);
        }
    }
}