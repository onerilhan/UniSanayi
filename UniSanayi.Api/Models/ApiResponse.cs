namespace UniSanayi.Api.Models
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = default!;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }
        public int StatusCode { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Success response with data
        public static ApiResponse<T> SuccessResponse(T data, string message = "İşlem başarılı.")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data,
                StatusCode = 200
            };
        }

        // Error response with data type
        public static ApiResponse<T> ErrorResponse(string message, int statusCode = 400, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = errors,
                StatusCode = statusCode
            };
        }
    }

    // Non-generic version for responses without data
    public class ApiResponse : ApiResponse<object>
    {
        // Success response without data
        public static ApiResponse SuccessResponse(string message = "İşlem başarılı.")
        {
            return new ApiResponse
            {
                Success = true,
                Message = message,
                StatusCode = 200
            };
        }

        // Error response without data
        public static new ApiResponse ErrorResponse(string message, int statusCode = 400, List<string>? errors = null)
        {
            return new ApiResponse
            {
                Success = false,
                Message = message,
                Errors = errors,
                StatusCode = statusCode
            };
        }
    }
}