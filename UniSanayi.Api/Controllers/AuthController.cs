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
                return BadRequest(new { message = "Bu email adresi zaten kullanımda." });
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
                return BadRequest(new { message = "Bu email adresi zaten kullanımda." });
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

            return Ok(new
            {
                message = "Şirket kaydı başarılı",
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
            });
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
            // User bul
            var user = await _context.Users
                .Include(u => u.Student)
                .Include(u => u.Company)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest(new { message = "Email veya şifre hatalı." });
            }

            // Şifre kontrolü
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return BadRequest(new { message = "Email veya şifre hatalı." });
            }

            // Account aktif mi?
            if (!user.IsActive)
            {
                return BadRequest(new { message = "Hesabınız devre dışı bırakıldı." });
            }

            // Token oluştur
            var token = GenerateJwtToken(user);

            // Response hazırla
            var response = new
            {
                message = "Giriş başarılı",
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
                return Ok(new
                {
                    response.message,
                    response.token,
                    response.user,
                    student = new
                    {
                        id = user.Student.Id,
                        firstName = user.Student.FirstName,
                        lastName = user.Student.LastName,
                        university = user.Student.UniversityName,
                        department = user.Student.Department,
                        isAvailable = user.Student.IsAvailable
                    }
                });
            }
            else if (user.UserType == "Company" && user.Company != null)
            {
                return Ok(new
                {
                    response.message,
                    response.token,
                    response.user,
                    company = new
                    {
                        id = user.Company.Id,
                        companyName = user.Company.CompanyName,
                        industry = user.Company.Industry,
                        isVerified = user.Company.IsVerified
                    }
                });
            }

            return Ok(response);
        }

        // POST: api/auth/change-password
        [HttpPost("change-password")]
        public async Task<ActionResult> ChangePassword(ChangePasswordRequest request)
        {
            // JWT token'dan user ID al (Authorization header'dan)
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Geçersiz token." });
            }

            var userId = Guid.Parse(userIdClaim.Value);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı." });
            }

            // Mevcut şifre kontrolü
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { message = "Mevcut şifre hatalı." });
            }

            // Yeni şifreyi hash'le ve güncelle
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Şifre başarıyla güncellendi." });
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
    }
}