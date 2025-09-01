using FluentValidation;
using UniSanayi.Api.DTOs.Students;

namespace UniSanayi.Api.Validators.Students
{
    public class AddStudentSkillRequestValidator : AbstractValidator<AddStudentSkillRequest>
    {
        public AddStudentSkillRequestValidator()
        {
            RuleFor(x => x.SkillId)
                .GreaterThan(0).WithMessage("Geçerli bir skill seçiniz.");

            RuleFor(x => x.ProficiencyLevel)
                .NotEmpty().WithMessage("Yetkinlik seviyesi zorunludur.")
                .Must(x => new[] { "Beginner", "Intermediate", "Advanced", "Expert" }.Contains(x))
                .WithMessage("Geçerli yetkinlik seviyesi seçiniz: Beginner, Intermediate, Advanced, Expert");

            RuleFor(x => x.YearsOfExperience)
                .GreaterThanOrEqualTo(0).WithMessage("Deneyim yılı negatif olamaz.")
                .LessThanOrEqualTo(50).WithMessage("Deneyim yılı 50'den fazla olamaz.")
                .When(x => x.YearsOfExperience.HasValue);

            // Business Logic: Yetkinlik seviyesi ile deneyim yılı uyumlu olmalı
            RuleFor(x => x)
                .Must(x => IsExperienceConsistentWithLevel(x.ProficiencyLevel, x.YearsOfExperience))
                .WithMessage("Deneyim yılı, yetkinlik seviyesi ile uyumlu değil.")
                .When(x => x.YearsOfExperience.HasValue);
        }

        private static bool IsExperienceConsistentWithLevel(string level, decimal? experience)
        {
            if (!experience.HasValue) return true;

            return level switch
            {
                "Beginner" => experience <= 2,
                "Intermediate" => experience >= 0.5m && experience <= 5,
                "Advanced" => experience >= 2 && experience <= 15,
                "Expert" => experience >= 5,
                _ => true
            };
        }
    }
}