using System.Net;

namespace UniSanayi.Api.Exceptions
{
    public class ValidationException : BaseException
    {
        public override HttpStatusCode StatusCode => HttpStatusCode.BadRequest;
        public override string ErrorType => "ValidationError";

        public ValidationException(string message) : base(message) { }

        public ValidationException(string message, List<string> validationErrors) 
            : base(message, validationErrors) { }

        public ValidationException(List<string> validationErrors) 
            : base("Doğrulama başarısız.", validationErrors) { }
    }
}