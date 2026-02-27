# Cloud Invoice Application

A cloud-based application for generating invoices tailored for consultant services. Built with a **React 19** frontend and an **ASP.NET Core 9 Minimal API** backend, deployed via Docker Compose with PostgreSQL.

---

## Features

- Google OAuth 2.0 social login
- Invoice creation with line items and PDF generation
- Client management (CRUD)
- View, filter, and search invoices by date
- Dark mode support
- Dockerized deployment with PostgreSQL database

---

## Tech Stack

| Layer      | Technology                                                  |
| ---------- | ----------------------------------------------------------- |
| Frontend   | React 19, TypeScript 5.7, Vite 6, Tailwind CSS 4, Radix UI / shadcn/ui |
| Backend    | ASP.NET Core 9, FastEndpoints 5.33, Entity Framework Core 9 |
| Database   | PostgreSQL 16                                               |
| Auth       | Google OAuth 2.0 + JWT (HS256)                              |
| PDF        | QuestPDF                                                    |
| Deployment | Docker Compose, multi-stage Dockerfile                      |

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js 22+](https://nodejs.org/) (for local frontend development)
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0) (for local backend development)
- A [Google Cloud Console](https://console.cloud.google.com/) project with OAuth 2.0 credentials

---

### Local Development

#### Backend

```bash
# Start PostgreSQL (if not using Docker Compose)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16

# Create src/CloudInvoiceApp.Backend/appsettings.local.json with:
# - ConnectionStrings:invoice-db
# - Jwt:SecretKey (32+ chars)
# - Google:ClientId

# Run with hot reload
dotnet watch run --project src/CloudInvoiceApp.Backend/CloudInvoiceApp.Backend.csproj
```

The backend runs on `https://localhost:5001` by default.

#### Frontend

```bash
cd src/CloudInvoiceApp.Web

# Install dependencies
npm install

# Start dev server (hot reload on localhost:5173)
npm run dev
```

#### Database Migrations

```bash
# Apply migrations
dotnet ef database update --project src/CloudInvoiceApp.Backend/

# Create a new migration
dotnet ef migrations add MigrationName --project src/CloudInvoiceApp.Backend/ --context InvoiceDbContext
```

> Migrations are also auto-applied on startup.

---

### Docker Deployment

```bash
cd deploy

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your values (see Configuration section)

# Build and start all services
docker-compose up --build

# Stop services
docker-compose down
```

The application is available at `http://localhost:<APP_PORT>` (default `8080`).

---

## Configuration

### Environment Variables (`deploy/.env`)

| Variable                    | Description                                | Default               |
| --------------------------- | ------------------------------------------ | --------------------- |
| `APP_IMAGE`                 | Docker image for the app                   | -                     |
| `APP_PORT`                  | Host port to expose                        | `8080`                |
| `POSTGRES_PASSWORD`         | PostgreSQL password                        | -                     |
| `POSTGRES_USER`             | PostgreSQL user                            | `postgres`            |
| `POSTGRES_DB`               | PostgreSQL database name                   | `InvoiceDb`           |
| `JWT_SECRET_KEY`            | JWT signing secret (min 32 chars)          | -                     |
| `JWT_ACCESS_EXPIRY_MINUTES` | Access token TTL in minutes                | `15`                  |
| `JWT_REFRESH_EXPIRY_DAYS`   | Refresh token TTL in days                  | `7`                   |
| `GOOGLE_CLIENT_ID`          | Google OAuth client ID                     | -                     |
| `ALLOWED_ORIGINS`           | CORS allowed origins (comma-separated)     | empty (allow all)     |

### Backend Configuration

Configuration is loaded in this precedence order:
1. Environment variables
2. `appsettings.{Environment}.json`
3. `appsettings.json`
4. `appsettings.local.json`

---

## Project Structure

```
cloud-invoice-app/
├── deploy/
│   ├── Dockerfile              # Multi-stage build (SDK + Node + runtime)
│   ├── docker-compose.yml      # Container orchestration
│   ├── .env.example            # Environment variable template
│   └── build-and-push.*        # Deployment scripts (sh + ps1)
├── src/
│   ├── CloudInvoiceApp.sln
│   ├── CloudInvoiceApp.Backend/
│   │   ├── Program.cs          # App bootstrap, DI, middleware
│   │   ├── Data/               # EF Core context and migrations
│   │   ├── Endpoints/          # FastEndpoints (Auth, Clients, Invoices)
│   │   ├── Models/             # Domain models
│   │   ├── Services/           # Business logic (Token, Audit, Cookie)
│   │   ├── Requests/           # Request DTOs
│   │   └── Responses/          # Response DTOs
│   ├── CloudInvoiceApp.Web/
│   │   ├── src/
│   │   │   ├── pages/          # Page components
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── contexts/       # AuthContext, ThemeContext
│   │   │   ├── services/       # API client, ConfigService
│   │   │   ├── layouts/        # AppLayout
│   │   │   └── types/          # TypeScript definitions
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── CloudInvoiceApp.AppHost/         # .NET Aspire orchestration
│   └── CloudInvoiceApp.ServiceDefaults/ # Shared service defaults
├── .github/workflows/          # CI/CD (placeholder)
├── CLAUDE.md                   # Project instructions for Claude Code
├── LICENSE                     # MIT License
└── README.md
```

---

## Architecture

### Authentication Flow

1. Frontend uses `@react-oauth/google` with a client ID fetched at runtime from `/api/config`
2. Google ID token is sent to `POST /api/auth/google-login`
3. Backend validates the token via Google APIs and issues a JWT access token + refresh token (httpOnly cookie)
4. Access token is held in memory (React state); refresh token is stored as a Secure, SameSite=Strict httpOnly cookie
5. Protected routes use `Authorization: Bearer <token>` header

### Key Integration Points

- **PDF Generation**: QuestPDF renders invoices to PDF on the backend
- **Database**: EF Core with PostgreSQL; migrations auto-applied on startup
- **Static Serving**: React production build is served from ASP.NET Core `wwwroot/`
- **Health Check**: Available at `/health`

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m "Add feature"`)
4. Push to the branch (`git push origin feature-name`)
5. Open a pull request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
