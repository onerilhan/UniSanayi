using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UniSanayi.Infrastructure.Persistence;
using UniSanayi.Domain.Entities;
using UniSanayi.Api.DTOs.Projects;

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

            return Ok(new { projects, totalCount, page = request.Page, pageSize = request.PageSize });
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
                return NotFound(new { message = "Proje bulunamadı." });

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

            return Ok(response);
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
                return NotFound(new { message = "Company profili bulunamadı." });

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

            return Ok(projects);
        }

        // POST: api/projects (Company - yeni proje)
        [HttpPost]
        [Authorize(Roles = "Company")]
        public async Task<ActionResult> CreateProject(CreateProjectRequest request)
        {
            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(new { message = "Company profili bulunamadı." });

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

            return Created($"/api/projects/{project.Id}", new { 
                message = "Proje başarıyla oluşturuldu.",
                projectId = project.Id 
            });
        }

        // PUT: api/projects/{id} (Company - proje güncelle)
        [HttpPut("{id}")]
        [Authorize(Roles = "Company")]
        public async Task<ActionResult> UpdateProject(Guid id, UpdateProjectRequest request)
        {
            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(new { message = "Company profili bulunamadı." });

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == company.Id);

            if (project == null)
                return NotFound(new { message = "Proje bulunamadı veya yetkiniz yok." });

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

            return Ok(new { message = "Proje başarıyla güncellendi." });
        }

        // POST: api/projects/{id}/skills (Company - skill requirement ekle)
        [HttpPost("{id}/skills")]
        [Authorize(Roles = "Company")]
        public async Task<ActionResult> AddSkillRequirement(Guid id, AddSkillRequirementRequest request)
        {
            var userId = GetCurrentUserId();
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (company == null)
                return NotFound(new { message = "Company profili bulunamadı." });

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == company.Id);

            if (project == null)
                return NotFound(new { message = "Proje bulunamadı veya yetkiniz yok." });

            // Skill var mı kontrol et
            var skill = await _context.Skills.FindAsync(request.SkillId);
            if (skill == null)
                return BadRequest(new { message = "Geçersiz skill ID." });

            // Zaten ekli mi kontrol et
            var existing = await _context.ProjectSkillRequirements
                .FirstOrDefaultAsync(psr => psr.ProjectId == id && psr.SkillId == request.SkillId);

            if (existing != null)
                return BadRequest(new { message = "Bu skill requirement zaten ekli." });

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

            return Ok(new { message = "Skill requirement başarıyla eklendi." });
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
                return NotFound(new { message = "Company profili bulunamadı." });

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == company.Id);

            if (project == null)
                return NotFound(new { message = "Proje bulunamadı veya yetkiniz yok." });

            var skillRequirement = await _context.ProjectSkillRequirements
                .FirstOrDefaultAsync(psr => psr.ProjectId == id && psr.SkillId == skillId);

            if (skillRequirement == null)
                return NotFound(new { message = "Skill requirement bulunamadı." });

            _context.ProjectSkillRequirements.Remove(skillRequirement);
            project.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Skill requirement başarıyla silindi." });
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim!);
        }
    }
}