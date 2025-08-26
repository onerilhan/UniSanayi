using Microsoft.EntityFrameworkCore;
using UniSanayi.Domain.Entities;

namespace UniSanayi.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Student> Students => Set<Student>();
        public DbSet<Company> Companies => Set<Company>();
        public DbSet<Skill> Skills => Set<Skill>();
        public DbSet<StudentSkill> StudentSkills => Set<StudentSkill>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<ProjectSkillRequirement> ProjectSkillRequirements => Set<ProjectSkillRequirement>();
        public DbSet<Application> Applications => Set<Application>();

        protected override void OnModelCreating(ModelBuilder m)
        {
            // ---- indexes for users
            m.Entity<User>().HasIndex(x => x.Email).HasDatabaseName("idx_users_email").IsUnique();
            m.Entity<User>().HasIndex(x => x.UserType).HasDatabaseName("idx_users_type");

            // ---- students
            m.Entity<Student>()
                .HasOne(x => x.User)
                .WithOne(u => u.Student!)
                .HasForeignKey<Student>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            m.Entity<Student>().HasIndex(x => x.UserId).HasDatabaseName("idx_students_user_id");
            m.Entity<Student>().HasIndex(x => x.UniversityName).HasDatabaseName("idx_students_university");
            m.Entity<Student>().HasIndex(x => x.Department).HasDatabaseName("idx_students_department");

            // ---- companies
            m.Entity<Company>()
                .HasOne(x => x.User)
                .WithOne(u => u.Company!)
                .HasForeignKey<Company>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            m.Entity<Company>().HasIndex(x => x.UserId).HasDatabaseName("idx_companies_user_id");
            m.Entity<Company>().HasIndex(x => x.Industry).HasDatabaseName("idx_companies_industry");
            m.Entity<Company>().HasIndex(x => x.LocationCity).HasDatabaseName("idx_companies_city");

            // ---- skills
            m.Entity<Skill>().HasIndex(x => x.Category).HasDatabaseName("idx_skills_category");
            m.Entity<Skill>().HasIndex(x => x.Name).HasDatabaseName("idx_skills_name").IsUnique();

            // ---- student_skills
            m.Entity<StudentSkill>().HasIndex(x => x.StudentId).HasDatabaseName("idx_student_skills_student");
            m.Entity<StudentSkill>().HasIndex(x => x.SkillId).HasDatabaseName("idx_student_skills_skill");
            m.Entity<StudentSkill>().HasIndex(x => x.ProficiencyLevel).HasDatabaseName("idx_student_skills_level");
            m.Entity<StudentSkill>().HasAlternateKey(x => new { x.StudentId, x.SkillId }); // UNIQUE(student_id, skill_id)
            m.Entity<StudentSkill>()
                .HasOne(x => x.Student).WithMany().HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Cascade);
            m.Entity<StudentSkill>()
                .HasOne(x => x.Skill).WithMany().HasForeignKey(x => x.SkillId).OnDelete(DeleteBehavior.Cascade);

            // ---- projects
            m.Entity<Project>().HasIndex(x => x.CompanyId).HasDatabaseName("idx_projects_company");
            m.Entity<Project>().HasIndex(x => x.Status!).HasDatabaseName("idx_projects_status");
            m.Entity<Project>().HasIndex(x => x.LocationCity!).HasDatabaseName("idx_projects_city");
            m.Entity<Project>().HasIndex(x => x.ProjectType).HasDatabaseName("idx_projects_type");
            m.Entity<Project>()
                .HasOne(x => x.Company).WithMany().HasForeignKey(x => x.CompanyId).OnDelete(DeleteBehavior.Cascade);

            // ---- project_skill_requirements
            m.Entity<ProjectSkillRequirement>().HasIndex(x => x.ProjectId).HasDatabaseName("idx_project_skills_project");
            m.Entity<ProjectSkillRequirement>().HasIndex(x => x.SkillId).HasDatabaseName("idx_project_skills_skill");
            m.Entity<ProjectSkillRequirement>().HasIndex(x => x.IsMandatory).HasDatabaseName("idx_project_skills_mandatory");
            m.Entity<ProjectSkillRequirement>().HasAlternateKey(x => new { x.ProjectId, x.SkillId }); // UNIQUE(project_id, skill_id)
            m.Entity<ProjectSkillRequirement>()
                .HasOne(x => x.Project).WithMany().HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Cascade);
            m.Entity<ProjectSkillRequirement>()
                .HasOne(x => x.Skill).WithMany().HasForeignKey(x => x.SkillId).OnDelete(DeleteBehavior.Cascade);

            // ---- applications
            m.Entity<Application>().HasIndex(x => x.ProjectId).HasDatabaseName("idx_applications_project");
            m.Entity<Application>().HasIndex(x => x.StudentId).HasDatabaseName("idx_applications_student");
            m.Entity<Application>().HasIndex(x => x.ApplicationStatus!).HasDatabaseName("idx_applications_status");
            m.Entity<Application>().HasAlternateKey(x => new { x.ProjectId, x.StudentId }); // UNIQUE(project_id, student_id)
            m.Entity<Application>()
                .HasOne(x => x.Project).WithMany().HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Cascade);
            m.Entity<Application>()
                .HasOne(x => x.Student).WithMany().HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Cascade);
        }
    }
}
