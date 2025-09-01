using FluentValidation;
using UniSanayi.Api.DTOs.Auth;

namespace UniSanayi.Api.Validators.Auth
{
    public class LoginRequestValidator : AbstractValidator<LoginRequest>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email adresi zorunludur.")
                .EmailAddress()
                .WithMessage("Geçerli bir email adresi giriniz.")
                .MaximumLength(255)
                .WithMessage("Email adresi maksimum 255 karakter olabilir.");

            RuleFor(x => x.Password)
                .NotEmpty()
                .WithMessage("Şifre zorunludur.")
                .MinimumLength(6)
                .WithMessage("Şifre en az 6 karakter olmalıdır.")
                .MaximumLength(20)
                .WithMessage("Şifre maksimum 20 karakter olabilir.");
        }
    }
}