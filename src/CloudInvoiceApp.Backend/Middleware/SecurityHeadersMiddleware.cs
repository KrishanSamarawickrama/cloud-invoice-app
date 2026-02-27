namespace CloudInvoiceApp.Backend.Middleware;

public class SecurityHeadersMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;
        headers["X-Content-Type-Options"] = "nosniff";
        headers["X-Frame-Options"] = "DENY";
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
        headers["Content-Security-Policy"] =
            "default-src 'self'; " +
            "script-src 'self' https://static.cloudflareinsights.com https://accounts.google.com; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https://lh3.googleusercontent.com; " +
            "font-src 'self'; " +
            "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://cloudflareinsights.com; " +
            "frame-src https://accounts.google.com;";

        await next(context);
    }
}

public static class SecurityHeadersMiddlewareExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        return app.UseMiddleware<SecurityHeadersMiddleware>();
    }
}
