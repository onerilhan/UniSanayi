using FluentValidation;
using UniSanayi.Api.DTOs.Projects;

namespace UniSanayi.Api.Validators.Projects
{
    public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
    {
        public CreateProjectRequestValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Proje başlığı zorunludur.")
                .Length(5, 255).WithMessage("Proje başlığı 5-255 karakter arasında olmalıdır.")
                .Matches(@"^[a-zA-ZçÇğĞıİöÖşŞüÜ0-9\s\-_.()]+$")
                .WithMessage("Proje başlığı sadece harf, rakam ve temel noktalama işaretleri içerebilir.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Proje açıklaması zorunludur.")
                .Length(50, 5000).WithMessage("Proje açıklaması 50-5000 karakter arasında olmalıdır.");

            RuleFor(x => x.ProjectType)
                .NotEmpty().WithMessage("Proje türü zorunludur.")
                .Must(x => new[] { "Internship", "PartTime", "FullTime", "Freelance", "Research", "Thesis" }.Contains(x))
                .WithMessage("Geçerli proje türü seçiniz: Internship, PartTime, FullTime, Freelance, Research, Thesis");

            RuleFor(x => x.DurationDays)
                .GreaterThan(0).WithMessage("Proje süresi 0'dan büyük olmalıdır.")
                .LessThanOrEqualTo(730).WithMessage("Proje süresi maksimum 2 yıl (730 gün) olabilir.");

            RuleFor(x => x.BudgetAmount)
                .GreaterThanOrEqualTo(0).WithMessage("Bütçe miktarı negatif olamaz.")
                .LessThanOrEqualTo(1000000).WithMessage("Bütçe miktarı maksimum 1.000.000 olabilir.")
                .When(x => x.BudgetAmount.HasValue);

            RuleFor(x => x.Currency)
                .Must(x => string.IsNullOrEmpty(x) || new[] { "TRY", "USD", "EUR" }.Contains(x))
                .WithMessage("Geçerli para birimi seçiniz: TRY, USD, EUR");

            RuleFor(x => x.LocationRequirement)
                .Must(x => string.IsNullOrEmpty(x) || new[] { "Remote", "On-site", "Hybrid" }.Contains(x))
                .WithMessage("Geçerli lokasyon gereksinimi seçiniz: Remote, On-site, Hybrid");

            RuleFor(x => x.MaxApplicants)
                .GreaterThan(0).WithMessage("Maksimum başvuru sayısı 0'dan büyük olmalıdır.")
                .LessThanOrEqualTo(1000).WithMessage("Maksimum başvuru sayısı 1000'i geçemez.")
                .When(x => x.MaxApplicants.HasValue);

            RuleFor(x => x.ApplicationDeadline)
                .GreaterThan(DateTimeOffset.UtcNow.AddDays(1)).WithMessage("Başvuru son tarihi en az 1 gün sonra olmalıdır.")
                .LessThan(DateTimeOffset.UtcNow.AddYears(1)).WithMessage("Başvuru son tarihi 1 yıldan fazla ileri olamaz.")
                .When(x => x.ApplicationDeadline.HasValue);

            RuleFor(x => x.ProjectStartDate)
                .GreaterThan(DateTimeOffset.UtcNow).WithMessage("Proje başlangıç tarihi gelecekte olmalıdır.")
                .LessThan(DateTimeOffset.UtcNow.AddYears(2)).WithMessage("Proje başlangıç tarihi 2 yıldan fazla ileri olamaz.")
                .When(x => x.ProjectStartDate.HasValue);

            // Cross-field validation
            RuleFor(x => x)
                .Must(x => !x.ApplicationDeadline.HasValue || !x.ProjectStartDate.HasValue || 
                          x.ApplicationDeadline < x.ProjectStartDate)
                .WithMessage("Başvuru son tarihi, proje başlangıç tarihinden önce olmalıdır.")
                .When(x => x.ApplicationDeadline.HasValue && x.ProjectStartDate.HasValue);

            RuleFor(x => x.LocationCity)
                .MaximumLength(100).WithMessage("Şehir adı maksimum 100 karakter olabilir.")
                .Matches(@"^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$").WithMessage("Şehir adı sadece harf içerebilir.")
                .When(x => !string.IsNullOrEmpty(x.LocationCity));
        }
    }
}