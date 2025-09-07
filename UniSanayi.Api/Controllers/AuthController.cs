using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using UniSanayi.Infrastructure.Persistence;
using UniSanayi.Domain.Entities;
using UniSanayi.Api.DTOs.Auth;
using UniSanayi.Api.Models;
using UniSanayi.Api.Validators.Auth;
using System.Text.Json;

namespace UniSanayi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/auth/register/student
        [HttpPost("register/student")]
        public async Task<ActionResult> RegisterStudent(StudentRegisterRequest request)
        {
            // Validation
            var validator = new StudentRegisterRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Doğrulama hataları oluştu.", 400, errors));
            }

            // Email kontrolü
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return BadRequest(ApiResponse.ErrorResponse("Bu email adresi zaten kullanımda.", 400));
            }

            // Password hash
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // User oluştur
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                PasswordHash = passwordHash,
                UserType = "Student",
                IsActive = true,
                EmailVerified = false,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            // Student profili oluştur
            var student = new Student
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                FirstName = request.FirstName,
                LastName = request.LastName,
                UniversityName = request.UniversityName,
                Department = request.Department,
                CurrentYear = request.CurrentYear,
                GraduationYear = request.GraduationYear,
                IsAvailable = true,
                CreatedAt = DateTimeOffset.UtcNow
            };

            // Database'e kaydet
            _context.Users.Add(user);
            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            // Token oluştur
            var token = GenerateJwtToken(user);

            var responseData = new
            {
                token = token,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    userType = user.UserType
                },
                student = new
                {
                    id = student.Id,
                    firstName = student.FirstName,
                    lastName = student.LastName,
                    university = student.UniversityName,
                    department = student.Department
                }
            };

            return Ok(ApiResponse<object>.SuccessResponse(responseData, "Öğrenci kaydı başarılı."));
        }

        // POST: api/auth/register/company
        [HttpPost("register/company")]
        public async Task<ActionResult> RegisterCompany(CompanyRegisterRequest request)
        {
            // Validation
            var validator = new CompanyRegisterRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Doğrulama hataları oluştu.", 400, errors));
            }

            // Email kontrolü
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return BadRequest(ApiResponse.ErrorResponse("Bu email adresi zaten kullanımda.", 400));
            }

            // Password hash
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // User oluştur
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                PasswordHash = passwordHash,
                UserType = "Company",
                IsActive = true,
                EmailVerified = false,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            // Company profili oluştur
            var company = new Company
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CompanyName = request.CompanyName,
                Industry = request.Industry,
                CompanySize = request.CompanySize,
                Website = request.Website,
                Description = request.Description,
                ContactPerson = request.ContactPerson,
                ContactPhone = request.ContactPhone,
                ContactEmail = request.ContactEmail,
                LocationCity = request.LocationCity,
                IsVerified = false,
                CreatedAt = DateTimeOffset.UtcNow
            };

            // Database'e kaydet
            _context.Users.Add(user);
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            // Token oluştur
            var token = GenerateJwtToken(user);

            var responseData = new
            {
                token = token,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    userType = user.UserType
                },
                company = new
                {
                    id = company.Id,
                    companyName = company.CompanyName,
                    industry = company.Industry,
                    isVerified = company.IsVerified
                }
            };

            return Ok(ApiResponse<object>.SuccessResponse(responseData, "Şirket kaydı başarılı."));
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult> Login(LoginRequest request)
        {
            var validator = new LoginRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Doğrulama hataları oluştu.", 400, errors));
            }
            // reCAPTCHA doğrulama
            if (string.IsNullOrEmpty(request.CaptchaToken))
            {
                return BadRequest(ApiResponse.ErrorResponse("Güvenlik doğrulaması gereklidir.", 400));
            }

            var isValidCaptcha = await VerifyRecaptchaAsync(request.CaptchaToken);
            if (!isValidCaptcha)
            {
                return BadRequest(ApiResponse.ErrorResponse("Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.", 400));
            }

            // User bul
            var user = await _context.Users
                .Include(u => u.Student)
                .Include(u => u.Company)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest(ApiResponse.ErrorResponse("Email veya şifre hatalı.", 400));
            }

            // Şifre kontrolü
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return BadRequest(ApiResponse.ErrorResponse("Email veya şifre hatalı.", 400));
            }

            // Account aktif mi?
            if (!user.IsActive)
            {
                return BadRequest(ApiResponse.ErrorResponse("Hesabınız devre dışı bırakıldı.", 400));
            }

            // Token oluştur
            var token = GenerateJwtToken(user);

            // Response hazırla
            var response = new
            {
                token = token,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    userType = user.UserType,
                    isActive = user.IsActive,
                    emailVerified = user.EmailVerified
                }
            };

            // User type'a göre profil bilgisi ekle
            if (user.UserType == "Student" && user.Student != null)
            {
                var responseData = new
                {
                    token = response.token,
                    user = response.user,
                    student = new
                    {
                        id = user.Student.Id,
                        firstName = user.Student.FirstName,
                        lastName = user.Student.LastName,
                        university = user.Student.UniversityName,
                        department = user.Student.Department,
                        isAvailable = user.Student.IsAvailable
                    }
                };

                return Ok(ApiResponse<object>.SuccessResponse(responseData, "Giriş başarılı."));
            }
            else if (user.UserType == "Company" && user.Company != null)
            {
                var responseData = new
                {
                    token = response.token,
                    user = response.user,
                    company = new
                    {
                        id = user.Company.Id,
                        companyName = user.Company.CompanyName,
                        industry = user.Company.Industry,
                        isVerified = user.Company.IsVerified
                    }
                };

                return Ok(ApiResponse<object>.SuccessResponse(responseData, "Giriş başarılı."));
            }

            return Ok(ApiResponse<object>.SuccessResponse(response, "Giriş başarılı."));
        }

        // POST: api/auth/change-password
        [HttpPost("change-password")]
        [Authorize]
        public async Task<ActionResult> ChangePassword(ChangePasswordRequest request)
        {
            // Validation
            var validator = new ChangePasswordRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Doğrulama hataları oluştu.", 400, errors));
            }

            // JWT token'dan user ID al (Authorization header'dan)
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(ApiResponse.ErrorResponse("Geçersiz token.", 401));
            }

            var userId = Guid.Parse(userIdClaim.Value);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(ApiResponse.ErrorResponse("Kullanıcı bulunamadı.", 404));
            }

            // Mevcut şifre kontrolü
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(ApiResponse.ErrorResponse("Mevcut şifre hatalı.", 400));
            }

            // Yeni şifreyi hash'le ve güncelle
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse.SuccessResponse("Şifre başarıyla güncellendi."));
        }

        // Private: JWT Token oluştur
        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "your-super-secret-key-min-32-characters-long");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.UserType),
                    new Claim("user_type", user.UserType)
                }),
                Expires = DateTime.UtcNow.AddDays(7), // 7 gün geçerli
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"] ?? "UniSanayi",
                Audience = _configuration["Jwt:Audience"] ?? "UniSanayi"
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // Private: reCAPTCHA doğrulama
private async Task<bool> VerifyRecaptchaAsync(string token)
{
    if (string.IsNullOrWhiteSpace(token))
        return false;

    var secretKey = "6LdkocErAAAAAFm2wzQ0jSU_9nE0mlY4kPhv1cLw"; // Secret Key
    var url = "https://www.google.com/recaptcha/api/siteverify";
    
    using var httpClient = new HttpClient();
    var parameters = new List<KeyValuePair<string, string>>
    {
        new("secret", secretKey),
        new("response", token)
    };
    
    var content = new FormUrlEncodedContent(parameters);
    var response = await httpClient.PostAsync(url, content);
    var jsonResponse = await response.Content.ReadAsStringAsync();
    
    try
    {
        using var jsonDoc = JsonDocument.Parse(jsonResponse);
        return jsonDoc.RootElement.GetProperty("success").GetBoolean();
    }
    catch
    {
        return false;
    }
}
    }
}