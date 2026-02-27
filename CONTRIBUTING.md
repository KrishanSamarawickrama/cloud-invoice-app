# Contributing to Cloud Invoice App

Thank you for your interest in contributing! Here's how you can help.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch from `main`
4. Set up your local development environment (see [README](README.md))

## Development Setup

### Prerequisites

- .NET 9 SDK
- Node.js 22+
- PostgreSQL 16 (or Docker)

### Backend

```bash
cd src/CloudInvoiceApp.Backend
dotnet restore
dotnet run
```

### Frontend

```bash
cd src/CloudInvoiceApp.Web
npm install
npm run dev
```

## Making Changes

### Code Style

- **Backend**: Follow standard C# conventions. Use the existing patterns in the codebase (FastEndpoints, EF Core).
- **Frontend**: TypeScript strict mode. Use existing patterns (React contexts, Axios services, Tailwind CSS).

### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb in imperative mood (e.g., "Add", "Fix", "Update")
- Keep the subject line under 72 characters

### Pull Requests

1. Ensure your code builds without errors (`dotnet build`, `npm run build`)
2. Run the linter (`npm run lint` for frontend)
3. Run type checks (`npx tsc --noEmit` for frontend)
4. Write a clear PR description explaining what and why
5. Link related issues if applicable

## Reporting Issues

- Use GitHub Issues to report bugs or request features
- Include steps to reproduce for bug reports
- Check existing issues before creating duplicates

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
