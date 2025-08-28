using System.Net;

namespace UniSanayi.Api.Exceptions
{
    public class UnauthorizedException : BaseException
    {
        public override HttpStatusCode StatusCode => HttpStatusCode.Unauthorized;
        public override string ErrorType => "Unauthorized";

        public UnauthorizedException(string message = "Yetkilendirme hatası.") : base(message) { }
    }
}