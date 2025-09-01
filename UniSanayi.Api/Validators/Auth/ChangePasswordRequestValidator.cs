using FluentValidation;
using UniSanayi.Api.DTOs.Auth;

namespace UniSanayi.Api.Validators.Auth
{
    public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
    {
        public ChangePasswordRequestValidator()
        {
            RuleFor(x => x.CurrentPassword)
                .NotEmpty().WithMessage("Mevcut şifre zorunludur.");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Yeni şifre zorunludur.")
                .MinimumLength(8).WithMessage("Yeni şifre en az 8 karakter olmalıdır.")
                .MaximumLength(20).WithMessage("Yeni şifre maksimum 20 karakter olabilir.")
                .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)").WithMessage("Yeni şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.")
                .NotEqual(x => x.CurrentPassword).WithMessage("Yeni şifre mevcut şifreden farklı olmalıdır.");
        }
    }
}