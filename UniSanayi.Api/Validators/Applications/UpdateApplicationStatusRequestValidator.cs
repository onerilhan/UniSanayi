using FluentValidation;
using UniSanayi.Api.DTOs.Applications;

namespace UniSanayi.Api.Validators.Applications
{
    public class UpdateApplicationStatusRequestValidator : AbstractValidator<UpdateApplicationStatusRequest>
    {
        public UpdateApplicationStatusRequestValidator()
        {
            RuleFor(x => x.Status)
                .NotEmpty().WithMessage("Başvuru durumu zorunludur.")
                .Must(x => new[] { "Pending", "Reviewed", "Accepted", "Rejected" }.Contains(x))
                .WithMessage("Geçerli başvuru durumu seçiniz: Pending, Reviewed, Accepted, Rejected");

            // Business rule: Pending'den Accepted'e direkt geçilemez
            RuleFor(x => x.Status)
                .NotEqual("Accepted").WithMessage("Başvuruyu kabul etmeden önce 'Reviewed' durumuna almalısınız.")
                .When(x => x.Status == "Accepted"); // Bu rule sadece frontend validation için
        }
    }
}