using System.Net;

namespace UniSanayi.Api.Exceptions
{
    public class NotFoundException : BaseException
    {
        public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
        public override string ErrorType => "NotFound";

        public NotFoundException(string message) : base(message) { }

        public NotFoundException(string resource, object key) 
            : base($"{resource} kaynağı '{key}' ID'si ile bulunamadı.") { }
    }
}