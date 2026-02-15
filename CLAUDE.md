# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cloud-based invoice management app for consultant services. Full-stack monorepo with a C#/.NET 9 backend and React/TypeScript frontend, orchestrated locally via .NET Aspire.

## Commands

### Full-Stack (recommended for local dev)
```bash
dotnet run --project src/CloudInvoiceApp.AppHost
```
This starts PostgreSQL (with pgAdmin), the backend, and the frontend together via Aspire. The Aspire dashboard shows all service URLs and logs.

### Backend Only
```bash
dotnet build src/CloudInvoiceApp.Backend
dotnet run --project src/CloudInvoiceApp.Backend
```

### Frontend Only
```bash
cd src/CloudInvoiceApp.Web
npm install    # first time
npm run dev    # Vite dev server on port 3000
npm run build  # tsc + vite build
npm run lint   # ESLint
```

### Database Migrations (EF Core)
```bash
# From src/CloudInvoiceApp.Backend:
dotnet ef migrations add <MigrationName>
dotnet ef database update
```
Migrations auto-run on backend startup (`Program.cs` calls `dbContext.Database.Migrate()`).

### Docker Compose (production-style)
```bash
docker-compose up --build
```

## Architecture

### Backend (`src/CloudInvoiceApp.Backend`)
- **ASP.NET 9 Minimal API** using **FastEndpoints** (not controllers). Each endpoint is a class in `Endpoints/`.
- **Entity Framework Core 9** with PostgreSQL (Npgsql). Single `InvoiceDbContext` in `Data/`.
- **Aspire integration**: `builder.AddNpgsqlDbContext<InvoiceDbContext>("invoice-db")` wires up the DB connection via Aspire service discovery.
- Request/Response DTOs live in `Requests/` and `Responses/` — separate from the `Models/` entity.
- The `Invoice` model stores `From`, `To`, `BankDetails`, and `Services` as **JSON strings** in the database. Endpoints serialize/deserialize these fields.
- `DatabaseSeeder.cs` seeds sample data on first run.
- Swagger available via FastEndpoints.Swagger.
- No authentication — all endpoints use `AllowAnonymous()`.

### Frontend (`src/CloudInvoiceApp.Web`)
- **React 19** + **TypeScript 5.7** + **Vite 6**.
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin. Theme colors defined as CSS variables in `src/index.css`.
- UI components built with **Radix UI** primitives (Dialog, Tooltip) and **shadcn/ui** patterns in `src/components/ui/`.
- **Axios** HTTP client. All API calls go through `src/services/ApiService.ts` with a hardcoded base URL (`http://localhost:5101/api`).
- Local component state only (`useState`) — no global state management.
- Path alias: `@` maps to `src/` (configured in `vite.config.ts`).
- Animations via **Framer Motion**.

### Aspire AppHost (`src/CloudInvoiceApp.AppHost`)
- Orchestrates PostgreSQL + pgAdmin, backend project, and frontend npm app.
- Frontend is added via `AddNpmApp` pointing to `CloudInvoiceApp.Web` with the `dev` script.
- PostgreSQL uses persistent data volume in run mode.

### Service Defaults (`src/CloudInvoiceApp.ServiceDefaults`)
- Shared Aspire configuration: OpenTelemetry, health checks, service discovery.

## API Endpoints

All under `/api`:
- `POST /api/invoices` — Create invoice
- `GET /api/invoices/list` — List all invoices (summary)
- `GET /api/invoices/{id:int}` — Get invoice detail (deserializes JSON fields)
- `PUT /api/invoices` — Update invoice
- `DELETE /api/invoices/{id:int}` — Delete invoice
- `GET /api/version` — Version info

## Key Patterns

- **FastEndpoints pattern**: Each endpoint class defines `Configure()` for routing/auth and `HandleAsync()` for logic. Inject `InvoiceDbContext` via constructor.
- **JSON-in-column storage**: Complex fields (From, To, BankDetails, Services) are stored as JSON strings in single DB columns, not as separate relational tables.
- **CORS**: Currently allows all origins (`WithOrigins("*")`).
