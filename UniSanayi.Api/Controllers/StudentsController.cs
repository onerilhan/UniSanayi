using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UniSanayi.Infrastructure.Persistence;
using UniSanayi.Domain.Entities;
using UniSanayi.Api.DTOs.Students;
using UniSanayi.Api.Models;
using UniSanayi.Api.Validators.Students;

namespace UniSanayi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StudentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/students/profile
        [HttpGet("profile")]
        public async Task<ActionResult<StudentProfileResponse>> GetProfile()
        {
            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(ApiResponse.ErrorResponse("Student profili bulunamadı.", 404));

            var response = new StudentProfileResponse
            {
                Id = student.Id,
                FirstName = student.FirstName,
                LastName = student.LastName,
                StudentNumber = student.StudentNumber,
                UniversityName = student.UniversityName,
                Department = student.Department,
                CurrentYear = student.CurrentYear,
                GraduationYear = student.GraduationYear,
                Gpa = student.Gpa,
                Phone = student.Phone,
                LocationCity = student.LocationCity,
                Bio = student.Bio,
                LinkedinUrl = student.LinkedinUrl,
                GithubUrl = student.GithubUrl,
                IsAvailable = student.IsAvailable,
                CreatedAt = student.CreatedAt
            };

            return Ok(ApiResponse<StudentProfileResponse>.SuccessResponse(response, "Profil bilgileri getirildi."));
        }

        // PUT: api/students/profile
        [HttpPut("profile")]
        public async Task<ActionResult> UpdateProfile(UpdateStudentProfileRequest request)
        {
            // Validation
            var validator = new UpdateStudentProfileRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Profil güncelleme parametreleri geçersiz.", 400, errors));
            }

            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(ApiResponse.ErrorResponse("Student profili bulunamadı.", 404));

            // Öğrenci numarası değiştiriliyorsa, başka birinde kayıtlı mı kontrol et
            if (!string.IsNullOrEmpty(request.StudentNumber) && request.StudentNumber != student.StudentNumber)
            {
                var existingStudent = await _context.Students
                    .FirstOrDefaultAsync(s => s.StudentNumber == request.StudentNumber && s.Id != student.Id);
                
                if (existingStudent != null)
                {
                    return BadRequest(ApiResponse.ErrorResponse("Bu öğrenci numarası zaten kullanımda.", 400));
                }
            }

            // Güncelleme
            if (request.FirstName != null) student.FirstName = request.FirstName;
            if (request.LastName != null) student.LastName = request.LastName;
            if (request.StudentNumber != null) student.StudentNumber = request.StudentNumber;
            if (request.UniversityName != null) student.UniversityName = request.UniversityName;
            if (request.Department != null) student.Department = request.Department;
            if (request.CurrentYear.HasValue) student.CurrentYear = request.CurrentYear;
            if (request.GraduationYear.HasValue) student.GraduationYear = request.GraduationYear;
            if (request.Gpa.HasValue) student.Gpa = request.Gpa;
            if (request.Phone != null) student.Phone = request.Phone;
            if (request.LocationCity != null) student.LocationCity = request.LocationCity;
            if (request.Bio != null) student.Bio = request.Bio;
            if (request.LinkedinUrl != null) student.LinkedinUrl = request.LinkedinUrl;
            if (request.GithubUrl != null) student.GithubUrl = request.GithubUrl;
            if (request.IsAvailable.HasValue) student.IsAvailable = request.IsAvailable.Value;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResponse("Profil başarıyla güncellendi."));
        }

        // GET: api/students/skills
        [HttpGet("skills")]
        public async Task<ActionResult<List<StudentSkillResponse>>> GetSkills()
        {
            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(ApiResponse.ErrorResponse("Student profili bulunamadı.", 404));

            var skills = await _context.StudentSkills
                .Include(ss => ss.Skill)
                .Where(ss => ss.StudentId == student.Id)
                .Select(ss => new StudentSkillResponse
                {
                    Id = ss.Id,
                    SkillId = ss.SkillId,
                    SkillName = ss.Skill!.Name,
                    SkillCategory = ss.Skill!.Category,
                    ProficiencyLevel = ss.ProficiencyLevel,
                    YearsOfExperience = ss.YearsOfExperience,
                    IsVerified = ss.IsVerified,
                    AddedDate = ss.AddedDate
                })
                .OrderBy(ss => ss.SkillCategory)
                .ThenBy(ss => ss.SkillName)
                .ToListAsync();

            return Ok(ApiResponse<List<StudentSkillResponse>>.SuccessResponse(skills, "Yetkinlikler başarıyla getirildi."));
        }

        // POST: api/students/skills
        [HttpPost("skills")]
        public async Task<ActionResult> AddSkill(AddStudentSkillRequest request)
        {
            // Validation
            var validator = new AddStudentSkillRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Yetkinlik ekleme parametreleri geçersiz.", 400, errors));
            }

            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(ApiResponse.ErrorResponse("Student profili bulunamadı.", 404));

            // Skill var mı ve aktif mi kontrol et
            var skill = await _context.Skills.FindAsync(request.SkillId);
            if (skill == null || !skill.IsActive)
                return BadRequest(ApiResponse.ErrorResponse("Geçersiz veya pasif skill.", 400));

            // Zaten ekli mi kontrol et
            var existing = await _context.StudentSkills
                .FirstOrDefaultAsync(ss => ss.StudentId == student.Id && ss.SkillId == request.SkillId);

            if (existing != null)
                return BadRequest(ApiResponse.ErrorResponse("Bu skill zaten profilinizde mevcut.", 400));

            // Maksimum skill sayısı kontrolü (iş kuralı)
            var currentSkillCount = await _context.StudentSkills
                .CountAsync(ss => ss.StudentId == student.Id);

            if (currentSkillCount >= 50) // Maksimum 50 skill
            {
                return BadRequest(ApiResponse.ErrorResponse("Maksimum 50 yetkinlik ekleyebilirsiniz.", 400));
            }

            var studentSkill = new StudentSkill
            {
                Id = Guid.NewGuid(),
                StudentId = student.Id,
                SkillId = request.SkillId,
                ProficiencyLevel = request.ProficiencyLevel,
                YearsOfExperience = request.YearsOfExperience ?? 0,
                IsVerified = false,
                AddedDate = DateTimeOffset.UtcNow
            };

            _context.StudentSkills.Add(studentSkill);
            await _context.SaveChangesAsync();

            var responseData = new { skillId = skill.Id, skillName = skill.Name };
            return Ok(ApiResponse<object>.SuccessResponse(responseData, "Yetkinlik başarıyla eklendi."));
        }

        // PUT: api/students/skills/{skillId}
        [HttpPut("skills/{skillId}")]
        public async Task<ActionResult> UpdateSkill(int skillId, AddStudentSkillRequest request)
        {
            // Validation (aynı validator kullanılabilir)
            var validator = new AddStudentSkillRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Yetkinlik güncelleme parametreleri geçersiz.", 400, errors));
            }

            // Request'teki skillId ile URL'deki skillId uyumlu olmalı
            if (request.SkillId != skillId)
            {
                return BadRequest(ApiResponse.ErrorResponse("Skill ID uyumsuzluğu.", 400));
            }

            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(ApiResponse.ErrorResponse("Student profili bulunamadı.", 404));

            var studentSkill = await _context.StudentSkills
                .Include(ss => ss.Skill)
                .FirstOrDefaultAsync(ss => ss.StudentId == student.Id && ss.SkillId == skillId);

            if (studentSkill == null)
                return NotFound(ApiResponse.ErrorResponse("Bu yetkinlik profilinizde bulunmuyor.", 404));

            // Güncelleme
            studentSkill.ProficiencyLevel = request.ProficiencyLevel;
            studentSkill.YearsOfExperience = request.YearsOfExperience ?? 0;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResponse("Yetkinlik başarıyla güncellendi."));
        }

        // DELETE: api/students/skills/{skillId}
        [HttpDelete("skills/{skillId}")]
        public async Task<ActionResult> RemoveSkill(int skillId)
        {
            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(ApiResponse.ErrorResponse("Student profili bulunamadı.", 404));

            var studentSkill = await _context.StudentSkills
                .FirstOrDefaultAsync(ss => ss.StudentId == student.Id && ss.SkillId == skillId);

            if (studentSkill == null)
                return NotFound(ApiResponse.ErrorResponse("Bu yetkinlik profilinizde bulunmuyor.", 404));

            _context.StudentSkills.Remove(studentSkill);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResponse("Yetkinlik başarıyla silindi."));
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim!);
        }
    }
}