// UniSanayi.Api/Validators/Companies/UpdateCompanyProfileRequestValidator.cs
using FluentValidation;
using UniSanayi.Api.DTOs.Companies;

namespace UniSanayi.Api.Validators.Companies
{
    public class UpdateCompanyProfileRequestValidator : AbstractValidator<UpdateCompanyProfileRequest>
    {
        public UpdateCompanyProfileRequestValidator()
        {
            RuleFor(x => x.CompanyName)
                .MaximumLength(100)
                .When(x => !string.IsNullOrEmpty(x.CompanyName))
                .WithMessage("Şirket adı en fazla 100 karakter olabilir.");

            RuleFor(x => x.Industry)
                .MaximumLength(50)
                .When(x => !string.IsNullOrEmpty(x.Industry))
                .WithMessage("Sektör en fazla 50 karakter olabilir.");

            RuleFor(x => x.CompanySize)
                .Must(BeValidCompanySize)
                .When(x => !string.IsNullOrEmpty(x.CompanySize))
                .WithMessage("Geçersiz şirket büyüklüğü. Geçerli değerler: 1-10, 11-50, 51-200, 201-1000, 1000+");

            RuleFor(x => x.Website)
                .Must(BeValidUrl)
                .When(x => !string.IsNullOrEmpty(x.Website))
                .WithMessage("Geçersiz website URL'i.");

            RuleFor(x => x.Description)
                .MaximumLength(1000)
                .When(x => !string.IsNullOrEmpty(x.Description))
                .WithMessage("Açıklama en fazla 1000 karakter olabilir.");

            RuleFor(x => x.ContactPerson)
                .MaximumLength(100)
                .When(x => !string.IsNullOrEmpty(x.ContactPerson))
                .WithMessage("İletişim kişisi adı en fazla 100 karakter olabilir.");

            RuleFor(x => x.ContactPhone)
                .Matches(@"^\+?[1-9]\d{1,14}$")
                .When(x => !string.IsNullOrEmpty(x.ContactPhone))
                .WithMessage("Geçersiz telefon numarası formatı.");

            RuleFor(x => x.ContactEmail)
                .EmailAddress()
                .When(x => !string.IsNullOrEmpty(x.ContactEmail))
                .WithMessage("Geçersiz email formatı.");

            RuleFor(x => x.LocationCity)
                .MaximumLength(50)
                .When(x => !string.IsNullOrEmpty(x.LocationCity))
                .WithMessage("Şehir adı en fazla 50 karakter olabilir.");
        }

        private static bool BeValidCompanySize(string? companySize)
        {
            if (string.IsNullOrEmpty(companySize))
                return false;
                
            var validSizes = new[] { "1-10", "11-50", "51-200", "201-1000", "1000+" };
            return validSizes.Contains(companySize);
        }

        private static bool BeValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url))
                return false;
                
            return Uri.TryCreate(url, UriKind.Absolute, out _);
        }
    }
}