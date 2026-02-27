# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | Yes                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities
2. Email the maintainer directly or use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
3. Include a description of the vulnerability, steps to reproduce, and potential impact
4. Allow reasonable time for a fix before public disclosure

## Security Measures

This application implements:

- JWT authentication with short-lived access tokens (15 min)
- Refresh tokens stored in httpOnly, Secure, SameSite=Strict cookies
- Rate limiting on authentication and PDF generation endpoints
- Security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- CORS with explicit origin allowlisting (fail-closed in production)
- HTTPS enforcement with HSTS
- Input validation on all API endpoints
- Parameterized database queries via Entity Framework Core
- Audit logging for sensitive operations

## Best Practices for Deployment

- Use a strong, unique JWT secret key (32+ characters)
- Configure `AllowedOrigins` with your specific domain(s)
- Configure `AllowedHosts` with your specific domain
- Use HTTPS in production
- Keep dependencies up to date
- Review the `deploy/.env.example` for all required configuration
