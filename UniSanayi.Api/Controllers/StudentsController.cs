using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UniSanayi.Infrastructure.Persistence;
using UniSanayi.Domain.Entities;
using UniSanayi.Api.DTOs.Students;

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
                return NotFound(new { message = "Student profili bulunamadı." });

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

            return Ok(response);
        }

        // PUT: api/students/profile
        [HttpPut("profile")]
        public async Task<ActionResult> UpdateProfile(UpdateStudentProfileRequest request)
        {
            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new { message = "Student profili bulunamadı." });

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

            return Ok(new { message = "Profil başarıyla güncellendi." });
        }

        // GET: api/students/skills
        [HttpGet("skills")]
        public async Task<ActionResult<List<StudentSkillResponse>>> GetSkills()
        {
            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new { message = "Student profili bulunamadı." });

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
                .ToListAsync();

            return Ok(skills);
        }

        // POST: api/students/skills
        [HttpPost("skills")]
        public async Task<ActionResult> AddSkill(AddStudentSkillRequest request)
        {
            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new { message = "Student profili bulunamadı." });

            // Skill var mı kontrol et
            var skill = await _context.Skills.FindAsync(request.SkillId);
            if (skill == null)
                return BadRequest(new { message = "Geçersiz skill ID." });

            // Zaten ekli mi kontrol et
            var existing = await _context.StudentSkills
                .FirstOrDefaultAsync(ss => ss.StudentId == student.Id && ss.SkillId == request.SkillId);

            if (existing != null)
                return BadRequest(new { message = "Bu skill zaten ekli." });

            var studentSkill = new StudentSkill
            {
                Id = Guid.NewGuid(),
                StudentId = student.Id,
                SkillId = request.SkillId,
                ProficiencyLevel = request.ProficiencyLevel,
                YearsOfExperience = request.YearsOfExperience,
                IsVerified = false,
                AddedDate = DateTimeOffset.UtcNow
            };

            _context.StudentSkills.Add(studentSkill);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Skill başarıyla eklendi." });
        }

        // DELETE: api/students/skills/{skillId}
        [HttpDelete("skills/{skillId}")]
        public async Task<ActionResult> RemoveSkill(int skillId)
        {
            var userId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new { message = "Student profili bulunamadı." });

            var studentSkill = await _context.StudentSkills
                .FirstOrDefaultAsync(ss => ss.StudentId == student.Id && ss.SkillId == skillId);

            if (studentSkill == null)
                return NotFound(new { message = "Skill bulunamadı." });

            _context.StudentSkills.Remove(studentSkill);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Skill başarıyla silindi." });
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim!);
        }
    }
}