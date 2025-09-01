using FluentValidation;
using UniSanayi.Api.DTOs.Students;

namespace UniSanayi.Api.Validators.Students
{
    public class UpdateStudentProfileRequestValidator : AbstractValidator<UpdateStudentProfileRequest>
    {
        public UpdateStudentProfileRequestValidator()
        {
            RuleFor(x => x.FirstName)
                .Length(2, 100).WithMessage("Ad 2-100 karakter arasında olmalıdır.")
                .Matches(@"^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$").WithMessage("Ad sadece harf içerebilir.")
                .When(x => !string.IsNullOrEmpty(x.FirstName));

            RuleFor(x => x.LastName)
                .Length(2, 100).WithMessage("Soyad 2-100 karakter arasında olmalıdır.")
                .Matches(@"^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$").WithMessage("Soyad sadece harf içerebilir.")
                .When(x => !string.IsNullOrEmpty(x.LastName));

            RuleFor(x => x.StudentNumber)
                .Length(5, 50).WithMessage("Öğrenci numarası 5-50 karakter arasında olmalıdır.")
                .Matches(@"^[0-9a-zA-Z]+$").WithMessage("Öğrenci numarası sadece harf ve rakam içerebilir.")
                .When(x => !string.IsNullOrEmpty(x.StudentNumber));

            RuleFor(x => x.UniversityName)
                .Length(5, 255).WithMessage("Üniversite adı 5-255 karakter arasında olmalıdır.")
                .When(x => !string.IsNullOrEmpty(x.UniversityName));

            RuleFor(x => x.Department)
                .Length(3, 255).WithMessage("Bölüm adı 3-255 karakter arasında olmalıdır.")
                .When(x => !string.IsNullOrEmpty(x.Department));

            RuleFor(x => x.CurrentYear)
                .InclusiveBetween(1, 6).WithMessage("Mevcut yıl 1-6 arasında olmalıdır.")
                .When(x => x.CurrentYear.HasValue);

            RuleFor(x => x.GraduationYear)
                .GreaterThanOrEqualTo(DateTime.Now.Year).WithMessage("Mezuniyet yılı bu yıldan önce olamaz.")
                .LessThanOrEqualTo(DateTime.Now.Year + 10).WithMessage("Mezuniyet yılı çok uzak bir gelecek olamaz.")
                .When(x => x.GraduationYear.HasValue);

            RuleFor(x => x.Gpa)
                .InclusiveBetween(0.00m, 4.00m).WithMessage("GPA 0.00-4.00 arasında olmalıdır.")
                .PrecisionScale(4, 2, false).WithMessage("GPA maksimum 2 ondalık basamak içerebilir.")
                .When(x => x.Gpa.HasValue);

            RuleFor(x => x.Phone)
                .Matches(@"^(\+90|0)?[1-9]\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$")
                .WithMessage("Geçerli bir Türkiye telefon numarası giriniz (örn: +90 532 123 45 67)")
                .When(x => !string.IsNullOrEmpty(x.Phone));

            RuleFor(x => x.LocationCity)
                .Length(2, 100).WithMessage("Şehir adı 2-100 karakter arasında olmalıdır.")
                .Matches(@"^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$").WithMessage("Şehir adı sadece harf içerebilir.")
                .When(x => !string.IsNullOrEmpty(x.LocationCity));

            RuleFor(x => x.Bio)
                .MaximumLength(1000).WithMessage("Biyografi maksimum 1000 karakter olabilir.")
                .When(x => !string.IsNullOrEmpty(x.Bio));

            RuleFor(x => x.LinkedinUrl)
                .Must(IsValidLinkedInUrl).WithMessage("Geçerli bir LinkedIn URL'i giriniz.")
                .When(x => !string.IsNullOrEmpty(x.LinkedinUrl));

            RuleFor(x => x.GithubUrl)
                .Must(IsValidGitHubUrl).WithMessage("Geçerli bir GitHub URL'i giriniz.")
                .When(x => !string.IsNullOrEmpty(x.GithubUrl));

            // Cross-field validation: Mezuniyet yılı, mevcut yıla göre mantıklı mı?
            RuleFor(x => x)
                .Must(x => !x.CurrentYear.HasValue || !x.GraduationYear.HasValue || 
                          x.GraduationYear >= DateTime.Now.Year + (4 - x.CurrentYear))
                .WithMessage("Mezuniyet yılı, mevcut yılınıza göre mantıksız görünüyor.")
                .When(x => x.CurrentYear.HasValue && x.GraduationYear.HasValue);
        }

        private static bool IsValidLinkedInUrl(string? url)
        {
            if (string.IsNullOrEmpty(url)) return true;
            return url.StartsWith("https://www.linkedin.com/in/") || 
                   url.StartsWith("https://linkedin.com/in/") ||
                   url.StartsWith("www.linkedin.com/in/") ||
                   url.StartsWith("linkedin.com/in/");
        }

        private static bool IsValidGitHubUrl(string? url)
        {
            if (string.IsNullOrEmpty(url)) return true;
            return url.StartsWith("https://github.com/") || 
                   url.StartsWith("https://www.github.com/") ||
                   url.StartsWith("github.com/") ||
                   url.StartsWith("www.github.com/");
        }
    }
}