using System.Net;
using System.Text.Json;
using UniSanayi.Api.Exceptions;
using UniSanayi.Api.Models;

namespace UniSanayi.Api.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "An unhandled exception occurred. RequestPath: {RequestPath}", 
                    context.Request.Path);

                await HandleExceptionAsync(context, exception);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = exception switch
            {
                BaseException ex => ApiResponse.ErrorResponse(
                    message: ex.Message,
                    statusCode: (int)ex.StatusCode,
                    errors: ex.Details
                ),
                
                UnauthorizedAccessException => ApiResponse.ErrorResponse(
                    message: "Yetkilendirme hatası. Giriş yapmanız gerekiyor.",
                    statusCode: (int)HttpStatusCode.Unauthorized
                ),
                
                ArgumentException ex => ApiResponse.ErrorResponse(
                    message: "Geçersiz parametre: " + ex.Message,
                    statusCode: (int)HttpStatusCode.BadRequest
                ),
                
                InvalidOperationException ex => ApiResponse.ErrorResponse(
                    message: "Geçersiz işlem: " + ex.Message,
                    statusCode: (int)HttpStatusCode.BadRequest
                ),
                
                NotImplementedException => ApiResponse.ErrorResponse(
                    message: "Bu özellik henüz geliştirilmemiş.",
                    statusCode: (int)HttpStatusCode.NotImplemented
                ),
                
                TimeoutException => ApiResponse.ErrorResponse(
                    message: "İstek zaman aşımına uğradı. Lütfen tekrar deneyiniz.",
                    statusCode: (int)HttpStatusCode.RequestTimeout
                ),
                
                _ => ApiResponse.ErrorResponse(
                    message: "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz.",
                    statusCode: (int)HttpStatusCode.InternalServerError
                )
            };

            context.Response.StatusCode = response.StatusCode;

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            };

            var jsonResponse = JsonSerializer.Serialize(response, jsonOptions);
            await context.Response.WriteAsync(jsonResponse);
        }
    }
}