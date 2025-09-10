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
using Google.Apis.Auth;

namespace UniSanayi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(AppDbContext context, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
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

        // POST: api/auth/google/login
        [HttpPost("google/login")]
        public async Task<ActionResult> GoogleLogin(GoogleLoginRequest request)
        {
            // Validation
            var validator = new GoogleLoginRequestValidator();
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse.ErrorResponse("Doğrulama hataları oluştu.", 400, errors));
            }

            try
            {
                // Google token'ı doğrula
                var googleUserInfo = await VerifyGoogleTokenAsync(request.GoogleToken);
                if (googleUserInfo == null)
                {
                    return BadRequest(ApiResponse.ErrorResponse("Geçersiz Google token.", 400));
                }

                // Kullanıcı zaten var mı kontrol et
                var existingUser = await _context.Users
                    .Include(u => u.Student)
                    .Include(u => u.Company)
                    .FirstOrDefaultAsync(u => u.Email == googleUserInfo.Email);

                if (existingUser != null)
                {
                    // Mevcut kullanıcı ile giriş yap
                    return HandleExistingGoogleUser(existingUser, request.UserType);
                }
                else
                {
                    // Yeni kullanıcı oluştur
                    return await CreateNewGoogleUser(googleUserInfo, request);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Google login error for token: {Token}", request.GoogleToken);
                return BadRequest(ApiResponse.ErrorResponse("Google ile giriş işleminde hata oluştu.", 500));
            }
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

        // Private Methods

        // Google token doğrulama
    private async Task<GoogleTokenInfo?> VerifyGoogleTokenAsync(string idToken)
        {
            try
            {
                var googleClientId = _configuration["Google:ClientId"];
                
                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, 
                    new GoogleJsonWebSignature.ValidationSettings()
                    {
                        Audience = new[] { googleClientId }
                    });

                if (payload?.EmailVerified != true)
                    return null;

                return new GoogleTokenInfo
                {
                    Email = payload.Email,
                    Name = payload.Name,
                    Given_name = payload.GivenName,
                    Family_name = payload.FamilyName,
                    Picture = payload.Picture,
                    Email_verified = payload.EmailVerified,
                    Sub = payload.Subject
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Google token validation failed");
                return null;
            }
        }

        // Mevcut Google kullanıcısı ile giriş (Synchronous - async değil)
        private ActionResult HandleExistingGoogleUser(User existingUser, string requestedUserType)
        {
            // Kullanıcı aktif mi?
            if (!existingUser.IsActive)
            {
                return BadRequest(ApiResponse.ErrorResponse("Hesabınız devre dışı bırakıldı.", 400));
            }

            // Kullanıcı türü uyuşuyor mu?
            if (existingUser.UserType != requestedUserType)
            {
                return BadRequest(ApiResponse.ErrorResponse($"Bu email adresi {existingUser.UserType} hesabı olarak kayıtlı. Lütfen doğru hesap türü ile giriş yapın.", 400));
            }

            // Token oluştur
            var token = GenerateJwtToken(existingUser);

            // Response hazırla
            if (existingUser.UserType == "Student" && existingUser.Student != null)
            {
                var responseData = new
                {
                    token = token,
                    user = new
                    {
                        id = existingUser.Id,
                        email = existingUser.Email,
                        userType = existingUser.UserType,
                        isActive = existingUser.IsActive,
                        emailVerified = true // Google ile giriş yapanların emaili doğrulanmış kabul edilir
                    },
                    student = new
                    {
                        id = existingUser.Student.Id,
                        firstName = existingUser.Student.FirstName,
                        lastName = existingUser.Student.LastName,
                        university = existingUser.Student.UniversityName,
                        department = existingUser.Student.Department,
                        isAvailable = existingUser.Student.IsAvailable
                    }
                };

                return Ok(ApiResponse<object>.SuccessResponse(responseData, "Google ile giriş başarılı."));
            }
            else if (existingUser.UserType == "Company" && existingUser.Company != null)
            {
                var responseData = new
                {
                    token = token,
                    user = new
                    {
                        id = existingUser.Id,
                        email = existingUser.Email,
                        userType = existingUser.UserType,
                        isActive = existingUser.IsActive,
                        emailVerified = true
                    },
                    company = new
                    {
                        id = existingUser.Company.Id,
                        companyName = existingUser.Company.CompanyName,
                        industry = existingUser.Company.Industry,
                        isVerified = existingUser.Company.IsVerified
                    }
                };

                return Ok(ApiResponse<object>.SuccessResponse(responseData, "Google ile giriş başarılı."));
            }

            return BadRequest(ApiResponse.ErrorResponse("Profil bilgileri eksik.", 400));
        }

        // Yeni Google kullanıcısı oluştur
        private async Task<ActionResult> CreateNewGoogleUser(GoogleTokenInfo googleUserInfo, GoogleLoginRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // User oluştur
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = googleUserInfo.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // Random password for Google users
                    UserType = request.UserType,
                    IsActive = true,
                    EmailVerified = true, // Google ile kayıt olanlarda email doğrulanmış kabul edilir
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                _context.Users.Add(user);

                if (request.UserType == "Student")
                {
                    // Student profili oluştur
                    var student = new Student
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        FirstName = request.FirstName ?? googleUserInfo.Given_name,
                        LastName = request.LastName ?? googleUserInfo.Family_name,
                        UniversityName = request.UniversityName!,
                        Department = request.Department!,
                        CurrentYear = request.CurrentYear,
                        GraduationYear = request.GraduationYear,
                        IsAvailable = true,
                        CreatedAt = DateTimeOffset.UtcNow
                    };

                    _context.Students.Add(student);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

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

                    return Ok(ApiResponse<object>.SuccessResponse(responseData, "Google ile öğrenci kaydı başarılı."));
                }
                else if (request.UserType == "Company")
                {
                    // Company profili oluştur
                    var company = new Company
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        CompanyName = request.CompanyName!,
                        Industry = request.Industry,
                        CompanySize = request.CompanySize,
                        ContactPerson = request.ContactPerson!,
                        ContactEmail = googleUserInfo.Email,
                        IsVerified = false,
                        CreatedAt = DateTimeOffset.UtcNow
                    };

                    _context.Companies.Add(company);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

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

                    return Ok(ApiResponse<object>.SuccessResponse(responseData, "Google ile şirket kaydı başarılı."));
                }

                await transaction.RollbackAsync();
                return BadRequest(ApiResponse.ErrorResponse("Geçersiz kullanıcı türü.", 400));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating Google user for email: {Email}", googleUserInfo.Email);
                return BadRequest(ApiResponse.ErrorResponse("Kayıt işleminde hata oluştu.", 500));
            }
        }

        // JWT Token oluştur
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

        // reCAPTCHA doğrulama
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