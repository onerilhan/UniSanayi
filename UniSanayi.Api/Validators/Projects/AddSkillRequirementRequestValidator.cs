using FluentValidation;
using UniSanayi.Api.DTOs.Projects;

namespace UniSanayi.Api.Validators.Projects
{
    public class AddSkillRequirementRequestValidator : AbstractValidator<AddSkillRequirementRequest>
    {
        public AddSkillRequirementRequestValidator()
        {
            RuleFor(x => x.SkillId)
                .GreaterThan(0).WithMessage("Geçerli bir skill seçiniz.");

            RuleFor(x => x.RequiredLevel)
                .NotEmpty().WithMessage("Gerekli seviye zorunludur.")
                .Must(x => new[] { "Beginner", "Intermediate", "Advanced" }.Contains(x))
                .WithMessage("Geçerli seviye seçiniz: Beginner, Intermediate, Advanced");

            RuleFor(x => x.WeightPercentage)
                .InclusiveBetween(1, 100).WithMessage("Bilgi yüzdesi 1-100 arasında olmalıdır.")
                .When(x => x.WeightPercentage.HasValue);
        }
    }
}