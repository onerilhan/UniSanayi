using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniSanayi.Infrastructure.Persistence;
using UniSanayi.Domain.Entities;
using UniSanayi.Api.DTOs.Skills;
using UniSanayi.Api.Models;

namespace UniSanayi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SkillsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SkillsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/skills (Public - tüm aktif skills)
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<SkillResponse>>> GetSkills([FromQuery] string? category = null)
        {
            var query = _context.Skills.Where(s => s.IsActive);

            if (!string.IsNullOrEmpty(category))
                query = query.Where(s => s.Category == category);

            var skills = await query
                .OrderBy(s => s.Category)
                .ThenBy(s => s.Name)
                .Select(s => new SkillResponse
                {
                    Id = s.Id,
                    Name = s.Name,
                    Category = s.Category,
                    DifficultyLevel = s.DifficultyLevel,
                    Description = s.Description,
                    IsActive = s.IsActive
                })
                .ToListAsync();

            return Ok(ApiResponse<List<SkillResponse>>.SuccessResponse(skills, "Yetkinlikler başarıyla getirildi."));
        }

        // GET: api/skills/categories (Public - tüm kategoriler)
        [HttpGet("categories")]
        [AllowAnonymous]
        public async Task<ActionResult<List<string>>> GetCategories()
        {
            var categories = await _context.Skills
                .Where(s => s.IsActive)
                .Select(s => s.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(ApiResponse<List<string>>.SuccessResponse(categories, "Kategoriler başarıyla getirildi."));
        }

        // GET: api/skills/{id} (Public - skill detayı)
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<SkillDetailResponse>> GetSkill(int id)
        {
            var skill = await _context.Skills.FindAsync(id);

            if (skill == null || !skill.IsActive)
                return NotFound(new { message = "Skill bulunamadı." });

            var response = new SkillDetailResponse
            {
                Id = skill.Id,
                Name = skill.Name,
                Category = skill.Category,
                DifficultyLevel = skill.DifficultyLevel,
                Description = skill.Description,
                IsActive = skill.IsActive,
                CreatedAt = skill.CreatedAt
            };

            return Ok(ApiResponse<SkillDetailResponse>.SuccessResponse(response, "Yetkinlik detayı başarıyla getirildi."));
        }

        // POST: api/skills/seed (Development - test data)
        [HttpPost("seed")]
        [AllowAnonymous]
        public async Task<ActionResult> SeedSkills()
        {
            // Eğer zaten skill varsa seed yapma
            var existingCount = await _context.Skills.CountAsync();
            if (existingCount > 0)
                return BadRequest(new { message = "Skills already exist. Use this endpoint only once." });

            var skills = new List<Skill>
            {
                // Programming Languages
                new Skill { Name = "JavaScript", Category = "Programming", DifficultyLevel = "Beginner", Description = "Web programlama dili" },
                new Skill { Name = "Python", Category = "Programming", DifficultyLevel = "Beginner", Description = "Genel amaçlı programlama dili" },
                new Skill { Name = "Java", Category = "Programming", DifficultyLevel = "Intermediate", Description = "Nesne yönelimli programlama dili" },
                new Skill { Name = "C#", Category = "Programming", DifficultyLevel = "Intermediate", Description = "Microsoft .NET platformu" },
                new Skill { Name = "TypeScript", Category = "Programming", DifficultyLevel = "Advanced", Description = "JavaScript süper seti" },
                new Skill { Name = "Go", Category = "Programming", DifficultyLevel = "Advanced", Description = "Google tarafından geliştirilen dil" },
                new Skill { Name = "Rust", Category = "Programming", DifficultyLevel = "Advanced", Description = "Sistem programlama dili" },
                new Skill { Name = "Swift", Category = "Programming", DifficultyLevel = "Intermediate", Description = "iOS uygulama geliştirme" },
                new Skill { Name = "Kotlin", Category = "Programming", DifficultyLevel = "Intermediate", Description = "Android uygulama geliştirme" },
                new Skill { Name = "PHP", Category = "Programming", DifficultyLevel = "Beginner", Description = "Web backend geliştirme" },

                // Frontend Technologies
                new Skill { Name = "React", Category = "Frontend", DifficultyLevel = "Intermediate", Description = "JavaScript kütüphanesi" },
                new Skill { Name = "Vue.js", Category = "Frontend", DifficultyLevel = "Intermediate", Description = "Progressive JavaScript framework" },
                new Skill { Name = "Angular", Category = "Frontend", DifficultyLevel = "Advanced", Description = "Google tarafından geliştirilen framework" },
                new Skill { Name = "HTML", Category = "Frontend", DifficultyLevel = "Beginner", Description = "Web sayfası markup dili" },
                new Skill { Name = "CSS", Category = "Frontend", DifficultyLevel = "Beginner", Description = "Stil ve tasarım dili" },
                new Skill { Name = "Sass/SCSS", Category = "Frontend", DifficultyLevel = "Intermediate", Description = "CSS ön işlemcisi" },
                new Skill { Name = "Bootstrap", Category = "Frontend", DifficultyLevel = "Beginner", Description = "CSS framework" },
                new Skill { Name = "Tailwind CSS", Category = "Frontend", DifficultyLevel = "Intermediate", Description = "Utility-first CSS framework" },
                new Skill { Name = "Next.js", Category = "Frontend", DifficultyLevel = "Advanced", Description = "React framework" },
                new Skill { Name = "Nuxt.js", Category = "Frontend", DifficultyLevel = "Advanced", Description = "Vue.js framework" },

                // Backend Technologies
                new Skill { Name = "Node.js", Category = "Backend", DifficultyLevel = "Intermediate", Description = "JavaScript runtime" },
                new Skill { Name = "Express.js", Category = "Backend", DifficultyLevel = "Intermediate", Description = "Node.js web framework" },
                new Skill { Name = "Django", Category = "Backend", DifficultyLevel = "Intermediate", Description = "Python web framework" },
                new Skill { Name = "Flask", Category = "Backend", DifficultyLevel = "Beginner", Description = "Micro Python web framework" },
                new Skill { Name = "Spring Boot", Category = "Backend", DifficultyLevel = "Advanced", Description = "Java framework" },
                new Skill { Name = "ASP.NET Core", Category = "Backend", DifficultyLevel = "Advanced", Description = "Microsoft web framework" },
                new Skill { Name = "Laravel", Category = "Backend", DifficultyLevel = "Intermediate", Description = "PHP framework" },
                new Skill { Name = "Ruby on Rails", Category = "Backend", DifficultyLevel = "Intermediate", Description = "Ruby web framework" },
                new Skill { Name = "FastAPI", Category = "Backend", DifficultyLevel = "Intermediate", Description = "Modern Python API framework" },

                // Database Technologies
                new Skill { Name = "PostgreSQL", Category = "Database", DifficultyLevel = "Intermediate", Description = "İlişkisel veritabanı" },
                new Skill { Name = "MySQL", Category = "Database", DifficultyLevel = "Beginner", Description = "Popüler SQL veritabanı" },
                new Skill { Name = "MongoDB", Category = "Database", DifficultyLevel = "Intermediate", Description = "NoSQL doküman veritabanı" },
                new Skill { Name = "Redis", Category = "Database", DifficultyLevel = "Intermediate", Description = "In-memory veri yapısı" },
                new Skill { Name = "SQLite", Category = "Database", DifficultyLevel = "Beginner", Description = "Hafif SQL veritabanı" },
                new Skill { Name = "Elasticsearch", Category = "Database", DifficultyLevel = "Advanced", Description = "Arama ve analitik motoru" },
                new Skill { Name = "Firebase", Category = "Database", DifficultyLevel = "Beginner", Description = "Google BaaS platformu" },

                // DevOps & Tools
                new Skill { Name = "Docker", Category = "DevOps", DifficultyLevel = "Advanced", Description = "Konteynerizasyon" },
                new Skill { Name = "Kubernetes", Category = "DevOps", DifficultyLevel = "Advanced", Description = "Container orkestrasyon" },
                new Skill { Name = "AWS", Category = "DevOps", DifficultyLevel = "Advanced", Description = "Amazon cloud servisleri" },
                new Skill { Name = "Azure", Category = "DevOps", DifficultyLevel = "Advanced", Description = "Microsoft cloud platformu" },
                new Skill { Name = "Google Cloud", Category = "DevOps", DifficultyLevel = "Advanced", Description = "Google cloud servisleri" },
                new Skill { Name = "Jenkins", Category = "DevOps", DifficultyLevel = "Intermediate", Description = "CI/CD otomasyon" },
                new Skill { Name = "GitHub Actions", Category = "DevOps", DifficultyLevel = "Intermediate", Description = "GitHub CI/CD" },
                new Skill { Name = "Terraform", Category = "DevOps", DifficultyLevel = "Advanced", Description = "Infrastructure as Code" },
                new Skill { Name = "Ansible", Category = "DevOps", DifficultyLevel = "Advanced", Description = "Konfigürasyon yönetimi" },
                new Skill { Name = "Nginx", Category = "DevOps", DifficultyLevel = "Intermediate", Description = "Web server ve load balancer" },

                // Version Control & Tools
                new Skill { Name = "Git", Category = "Tools", DifficultyLevel = "Intermediate", Description = "Versiyon kontrol sistemi" },
                new Skill { Name = "GitHub", Category = "Tools", DifficultyLevel = "Beginner", Description = "Git hosting platformu" },
                new Skill { Name = "GitLab", Category = "Tools", DifficultyLevel = "Intermediate", Description = "DevOps platformu" },
                new Skill { Name = "Jira", Category = "Tools", DifficultyLevel = "Beginner", Description = "Proje yönetim aracı" },
                new Skill { Name = "Postman", Category = "Tools", DifficultyLevel = "Beginner", Description = "API test aracı" },
                new Skill { Name = "VS Code", Category = "Tools", DifficultyLevel = "Beginner", Description = "Kod editörü" },
                new Skill { Name = "IntelliJ IDEA", Category = "Tools", DifficultyLevel = "Intermediate", Description = "Java IDE" },

                // Design & UI/UX
                new Skill { Name = "Figma", Category = "Design", DifficultyLevel = "Beginner", Description = "UI/UX tasarım aracı" },
                new Skill { Name = "Adobe Photoshop", Category = "Design", DifficultyLevel = "Intermediate", Description = "Görsel tasarım" },
                new Skill { Name = "Adobe Illustrator", Category = "Design", DifficultyLevel = "Intermediate", Description = "Vektör grafik tasarım" },
                new Skill { Name = "Sketch", Category = "Design", DifficultyLevel = "Intermediate", Description = "Mac için tasarım aracı" },
                new Skill { Name = "Adobe XD", Category = "Design", DifficultyLevel = "Beginner", Description = "UI/UX prototyping" },
                new Skill { Name = "Canva", Category = "Design", DifficultyLevel = "Beginner", Description = "Online tasarım platformu" },

                // Mobile Development
                new Skill { Name = "React Native", Category = "Mobile", DifficultyLevel = "Advanced", Description = "Cross-platform mobile framework" },
                new Skill { Name = "Flutter", Category = "Mobile", DifficultyLevel = "Advanced", Description = "Google mobile framework" },
                new Skill { Name = "iOS Development", Category = "Mobile", DifficultyLevel = "Advanced", Description = "Native iOS uygulamaları" },
                new Skill { Name = "Android Development", Category = "Mobile", DifficultyLevel = "Advanced", Description = "Native Android uygulamaları" },
                new Skill { Name = "Xamarin", Category = "Mobile", DifficultyLevel = "Intermediate", Description = "Microsoft mobile framework" },

                // Data Science & Analytics
                new Skill { Name = "Pandas", Category = "DataScience", DifficultyLevel = "Intermediate", Description = "Python veri analizi" },
                new Skill { Name = "NumPy", Category = "DataScience", DifficultyLevel = "Intermediate", Description = "Python bilimsel hesaplama" },
                new Skill { Name = "Matplotlib", Category = "DataScience", DifficultyLevel = "Beginner", Description = "Python veri görselleştirme" },
                new Skill { Name = "Tableau", Category = "DataScience", DifficultyLevel = "Intermediate", Description = "İş zekası ve veri görselleştirme" },
                new Skill { Name = "Power BI", Category = "DataScience", DifficultyLevel = "Intermediate", Description = "Microsoft veri analizi" },
                new Skill { Name = "SQL", Category = "DataScience", DifficultyLevel = "Beginner", Description = "Veritabanı sorgulama" },
                new Skill { Name = "Excel", Category = "DataScience", DifficultyLevel = "Beginner", Description = "Elektronik tablo uygulaması" },

                // Testing
                new Skill { Name = "Jest", Category = "Testing", DifficultyLevel = "Intermediate", Description = "JavaScript test framework" },
                new Skill { Name = "Selenium", Category = "Testing", DifficultyLevel = "Intermediate", Description = "Web otomasyon test" },
                new Skill { Name = "Cypress", Category = "Testing", DifficultyLevel = "Advanced", Description = "End-to-end testing" },
                new Skill { Name = "Unit Testing", Category = "Testing", DifficultyLevel = "Intermediate", Description = "Birim test yazma" }
            };

            _context.Skills.AddRange(skills);
            await _context.SaveChangesAsync();

            var responseData = new { 
            count = skills.Count,
            categories = skills.Select(s => s.Category).Distinct().ToList()
            };
            return Ok(ApiResponse<object>.SuccessResponse(responseData, "Yetkinlikler başarıyla oluşturuldu!"));
        }
    }
}