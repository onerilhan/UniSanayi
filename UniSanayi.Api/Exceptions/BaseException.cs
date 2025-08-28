using System.Net;

namespace UniSanayi.Api.Exceptions
{
    public abstract class BaseException : Exception
    {
        public abstract HttpStatusCode StatusCode { get; }
        public abstract string ErrorType { get; }
        public List<string>? Details { get; protected set; }

        protected BaseException(string message) : base(message) { }

        protected BaseException(string message, Exception innerException) 
            : base(message, innerException) { }

        protected BaseException(string message, List<string> details) 
            : base(message) 
        {
            Details = details;
        }
    }
}