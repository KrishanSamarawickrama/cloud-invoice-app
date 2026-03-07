namespace CloudInvoiceApp.Backend.Services;

public static class CookieHelper
{
    private const string CookieName = "RefreshToken";
    private const string CookiePath = "/";

    public static void SetRefreshTokenCookie(HttpContext context, string token, int expiryDays, bool isDevelopment)
    {
        // Clear legacy cookie that used the old narrower path
        context.Response.Cookies.Delete(CookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Lax,
            Path = "/api/auth"
        });

        context.Response.Cookies.Append(CookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Lax,
            Path = CookiePath,
            MaxAge = TimeSpan.FromDays(expiryDays)
        });
    }

    public static void ClearRefreshTokenCookie(HttpContext context, bool isDevelopment)
    {
        // Clear legacy cookie (old path)
        context.Response.Cookies.Delete(CookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Lax,
            Path = "/api/auth"
        });

        context.Response.Cookies.Delete(CookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Lax,
            Path = CookiePath
        });
    }

    public static string? GetRefreshToken(HttpContext context)
    {
        return context.Request.Cookies[CookieName];
    }
}
