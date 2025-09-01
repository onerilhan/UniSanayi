using FluentValidation;
using UniSanayi.Api.DTOs.Projects;

namespace UniSanayi.Api.Validators.Projects
{
    public class ProjectFilterRequestValidator : AbstractValidator<ProjectFilterRequest>
    {
        public ProjectFilterRequestValidator()
        {
            RuleFor(x => x.ProjectType)
                .Must(x => new[] { "Internship", "PartTime", "FullTime", "Freelance", "Research", "Thesis" }.Contains(x))
                .WithMessage("Geçerli proje türü seçiniz.")
                .When(x => !string.IsNullOrEmpty(x.ProjectType));

            RuleFor(x => x.LocationRequirement)
                .Must(x => new[] { "Remote", "On-site", "Hybrid" }.Contains(x))
                .WithMessage("Geçerli lokasyon gereksinimi seçiniz.")
                .When(x => !string.IsNullOrEmpty(x.LocationRequirement));

            RuleFor(x => x.MinBudget)
                .GreaterThanOrEqualTo(0).WithMessage("Minimum bütçe negatif olamaz.")
                .When(x => x.MinBudget.HasValue);

            RuleFor(x => x.MaxBudget)
                .GreaterThanOrEqualTo(0).WithMessage("Maksimum bütçe negatif olamaz.")
                .GreaterThanOrEqualTo(x => x.MinBudget).WithMessage("Maksimum bütçe, minimum bütçeden küçük olamaz.")
                .When(x => x.MaxBudget.HasValue);

            RuleFor(x => x.Page)
                .GreaterThan(0).WithMessage("Sayfa numarası 0'dan büyük olmalıdır.");

            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, 100).WithMessage("Sayfa boyutu 1-100 arasında olmalıdır.");

            RuleFor(x => x.LocationCity)
                .MaximumLength(100).WithMessage("Şehir adı maksimum 100 karakter olabilir.")
                .When(x => !string.IsNullOrEmpty(x.LocationCity));
        }
    }
}