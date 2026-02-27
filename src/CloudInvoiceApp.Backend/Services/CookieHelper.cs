namespace CloudInvoiceApp.Backend.Services;

public static class CookieHelper
{
    private const string CookieName = "RefreshToken";
    private const string CookiePath = "/api/auth";

    public static void SetRefreshTokenCookie(HttpContext context, string token, int expiryDays, bool isDevelopment)
    {
        context.Response.Cookies.Append(CookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Strict,
            Path = CookiePath,
            MaxAge = TimeSpan.FromDays(expiryDays)
        });
    }

    public static void ClearRefreshTokenCookie(HttpContext context, bool isDevelopment)
    {
        context.Response.Cookies.Delete(CookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Strict,
            Path = CookiePath
        });
    }

    public static string? GetRefreshToken(HttpContext context)
    {
        return context.Request.Cookies[CookieName];
    }
}
