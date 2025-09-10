using FluentValidation;
using UniSanayi.Api.DTOs.Auth;

namespace UniSanayi.Api.Validators.Auth
{
    public class GoogleLoginRequestValidator : AbstractValidator<GoogleLoginRequest>
    {
        public GoogleLoginRequestValidator()
        {
            RuleFor(x => x.GoogleToken)
                .NotEmpty().WithMessage("Google token zorunludur.");

            RuleFor(x => x.UserType)
                .NotEmpty().WithMessage("Kullanıcı türü zorunludur.")
                .Must(x => new[] { "Student", "Company" }.Contains(x))
                .WithMessage("Kullanıcı türü 'Student' veya 'Company' olmalıdır.");

            // Student için gerekli alanlar
            When(x => x.UserType == "Student", () => {
                RuleFor(x => x.FirstName)
                    .NotEmpty().WithMessage("Ad zorunludur.")
                    .MaximumLength(100).WithMessage("Ad maksimum 100 karakter olabilir.");

                RuleFor(x => x.LastName)
                    .NotEmpty().WithMessage("Soyad zorunludur.")
                    .MaximumLength(100).WithMessage("Soyad maksimum 100 karakter olabilir.");

                RuleFor(x => x.UniversityName)
                    .NotEmpty().WithMessage("Üniversite adı zorunludur.")
                    .MaximumLength(255).WithMessage("Üniversite adı maksimum 255 karakter olabilir.");

                RuleFor(x => x.Department)
                    .NotEmpty().WithMessage("Bölüm zorunludur.")
                    .MaximumLength(255).WithMessage("Bölüm maksimum 255 karakter olabilir.");

                RuleFor(x => x.CurrentYear)
                    .InclusiveBetween(1, 6).WithMessage("Mevcut yıl 1-6 arasında olmalıdır.")
                    .When(x => x.CurrentYear.HasValue);

                RuleFor(x => x.GraduationYear)
                    .GreaterThanOrEqualTo(DateTime.Now.Year).WithMessage("Mezuniyet yılı geçmiş bir yıl olamaz.")
                    .LessThanOrEqualTo(DateTime.Now.Year + 10).WithMessage("Mezuniyet yılı çok uzak bir gelecek olamaz.")
                    .When(x => x.GraduationYear.HasValue);
            });

            // Company için gerekli alanlar
            When(x => x.UserType == "Company", () => {
                RuleFor(x => x.CompanyName)
                    .NotEmpty().WithMessage("Şirket adı zorunludur.")
                    .MaximumLength(255).WithMessage("Şirket adı maksimum 255 karakter olabilir.");

                RuleFor(x => x.ContactPerson)
                    .NotEmpty().WithMessage("İletişim kişisi zorunludur.")
                    .MaximumLength(255).WithMessage("İletişim kişisi maksimum 255 karakter olabilir.");

                RuleFor(x => x.CompanySize)
                    .Must(x => string.IsNullOrEmpty(x) || new[] { "1-10", "11-50", "51-200", "201-1000", "1000+" }.Contains(x))
                    .WithMessage("Geçerli şirket büyüklüğü seçiniz.")
                    .When(x => !string.IsNullOrEmpty(x.CompanySize));
            });
        }
    }
}