using FluentValidation;
using UniSanayi.Api.DTOs.Applications;

namespace UniSanayi.Api.Validators.Applications
{
    public class CreateApplicationRequestValidator : AbstractValidator<CreateApplicationRequest>
    {
        public CreateApplicationRequestValidator()
        {
            RuleFor(x => x.ProjectId)
                .NotEmpty().WithMessage("Proje seçimi zorunludur.");

            RuleFor(x => x.CoverLetter)
                .MinimumLength(50).WithMessage("Motivation mektubu en az 50 karakter olmalıdır.")
                .MaximumLength(2000).WithMessage("Motivation mektubu maksimum 2000 karakter olabilir.")
                .Must(ContainsMeaningfulContent).WithMessage("Motivation mektubu anlamlı içerik içermelidir.")
                .When(x => !string.IsNullOrEmpty(x.CoverLetter));

            // İsteğe bağlı motivation mektubu için uyarı
            RuleFor(x => x.CoverLetter)
                .NotNull().WithMessage("Başvurunuzun değerlendirilme şansını artırmak için motivation mektubu yazmanızı öneririz.");
        }

        private static bool ContainsMeaningfulContent(string? coverLetter)
        {
            if (string.IsNullOrWhiteSpace(coverLetter)) return false;

            // Tekrarlayan karakterler kontrolü (spam önlemi)
            var repeatingPattern = new System.Text.RegularExpressions.Regex(@"(.)\1{10,}");
            if (repeatingPattern.IsMatch(coverLetter))
                return false;

            // En az birkaç kelime olmalı
            var words = coverLetter.Split(new[] { ' ', '\n', '\r', '\t' }, 
                StringSplitOptions.RemoveEmptyEntries);
            
            if (words.Length < 10) return false;

            // Çok kısa kelimelerden oluşmamalı
            var meaningfulWords = words.Where(w => w.Length >= 3).Count();
            return meaningfulWords >= 7;
        }
    }
}