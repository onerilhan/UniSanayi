using FluentValidation;
using UniSanayi.Api.DTOs.Auth;

namespace UniSanayi.Api.Validators.Auth
{
    public class StudentRegisterRequestValidator : AbstractValidator<StudentRegisterRequest>
    {
        public StudentRegisterRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email adresi zorunludur.")
                .EmailAddress().WithMessage("Geçerli bir email adresi giriniz.")
                .MaximumLength(255).WithMessage("Email adresi maksimum 255 karakter olabilir.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Şifre zorunludur.")
                .MinimumLength(8).WithMessage("Şifre en az 8 karakter olmalıdır.")
                .MaximumLength(100).WithMessage("Şifre maksimum 100 karakter olabilir.")
                .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)").WithMessage("Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.");

            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("Ad zorunludur.")
                .MaximumLength(100).WithMessage("Ad maksimum 100 karakter olabilir.")
                .Matches(@"^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$").WithMessage("Ad sadece harf içerebilir.");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Soyad zorunludur.")
                .MaximumLength(100).WithMessage("Soyad maksimum 100 karakter olabilir.")
                .Matches(@"^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$").WithMessage("Soyad sadece harf içerebilir.");

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
        }
    }
}