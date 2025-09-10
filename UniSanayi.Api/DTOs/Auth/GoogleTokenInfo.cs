namespace UniSanayi.Api.DTOs.Auth
{
    public class GoogleTokenInfo
    {
        public string Email { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string Given_name { get; set; } = default!;
        public string Family_name { get; set; } = default!;
        public string Picture { get; set; } = default!;
        public bool Email_verified { get; set; }
        public string Sub { get; set; } = default!; // Google User ID
    }
}