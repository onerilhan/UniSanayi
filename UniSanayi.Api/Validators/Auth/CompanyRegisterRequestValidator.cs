using FluentValidation;
using UniSanayi.Api.DTOs.Auth;

namespace UniSanayi.Api.Validators.Auth
{
    public class CompanyRegisterRequestValidator : AbstractValidator<CompanyRegisterRequest>
    {
        public CompanyRegisterRequestValidator()
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

            RuleFor(x => x.CompanyName)
                .NotEmpty().WithMessage("Şirket adı zorunludur.")
                .MaximumLength(255).WithMessage("Şirket adı maksimum 255 karakter olabilir.");

            RuleFor(x => x.ContactPerson)
                .NotEmpty().WithMessage("İletişim kişisi zorunludur.")
                .MaximumLength(255).WithMessage("İletişim kişisi maksimum 255 karakter olabilir.");

            RuleFor(x => x.Industry)
                .MaximumLength(100).WithMessage("Sektör maksimum 100 karakter olabilir.")
                .When(x => !string.IsNullOrEmpty(x.Industry));

            RuleFor(x => x.CompanySize)
                .Must(x => string.IsNullOrEmpty(x) || new[] { "1-10", "11-50", "51-200", "201-1000", "1000+" }.Contains(x))
                .WithMessage("Şirket büyüklüğü geçerli değerlerden biri olmalıdır.");

            RuleFor(x => x.Website)
                .Matches(@"^https?:\/\/.+").WithMessage("Website geçerli bir URL olmalıdır.")
                .When(x => !string.IsNullOrEmpty(x.Website));

            RuleFor(x => x.ContactPhone)
                .Matches(@"^(\+90|0)?[1-9]\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$").WithMessage("Geçerli bir telefon numarası giriniz.")
                .When(x => !string.IsNullOrEmpty(x.ContactPhone));

            RuleFor(x => x.ContactEmail)
                .EmailAddress().WithMessage("Geçerli bir email adresi giriniz.")
                .When(x => !string.IsNullOrEmpty(x.ContactEmail));
        }
    }
}