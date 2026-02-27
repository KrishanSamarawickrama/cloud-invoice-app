# =============================================================================
# Stage 1: Build the .NET backend
# =============================================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dotnet-build
WORKDIR /src

# Disable fallback package folders and telemetry
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=true \
    DOTNET_CLI_TELEMETRY_OPTOUT=true \
    DOTNET_NUGET_SIGNATURE_VERIFICATION=false

# Create NuGet.config to use nuget.org only
RUN mkdir -p /root/.nuget/NuGet && \
    printf '<?xml version="1.0" encoding="utf-8"?>\n<configuration>\n  <packageSources>\n    <clear />\n    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />\n  </packageSources>\n</configuration>' > /root/.nuget/NuGet/NuGet.Config

# Restore — layer-cached until .csproj files change
COPY src/CloudInvoiceApp.Backend/CloudInvoiceApp.Backend.csproj CloudInvoiceApp.Backend/
COPY src/CloudInvoiceApp.ServiceDefaults/CloudInvoiceApp.ServiceDefaults.csproj CloudInvoiceApp.ServiceDefaults/
RUN dotnet restore CloudInvoiceApp.Backend/CloudInvoiceApp.Backend.csproj

# Copy source
COPY src/CloudInvoiceApp.Backend/ CloudInvoiceApp.Backend/
COPY src/CloudInvoiceApp.ServiceDefaults/ CloudInvoiceApp.ServiceDefaults/

# Clean any cached fallback folder references and publish
RUN rm -rf CloudInvoiceApp.Backend/obj CloudInvoiceApp.ServiceDefaults/obj && \
    dotnet nuget locals all --clear && \
    dotnet publish CloudInvoiceApp.Backend/CloudInvoiceApp.Backend.csproj \
    -c Release \
    -o /app/publish \
    -p:RestoreFallbackFolders= \
    -p:RestoreAdditionalProjectSources=

# =============================================================================
# Stage 2: Build the React/Vite frontend
# =============================================================================
FROM node:22-alpine AS node-build
WORKDIR /app

# Install deps — layer-cached until package-lock.json changes
COPY src/CloudInvoiceApp.Web/package.json src/CloudInvoiceApp.Web/package-lock.json ./
RUN npm ci

COPY src/CloudInvoiceApp.Web/ .

# Build args injected at docker build time
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build
# Output is at /app/dist/

# =============================================================================
# Stage 3: Final runtime image
# =============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# libgdiplus is required by QuestPDF for PDF generation
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgdiplus \
    && rm -rf /var/lib/apt/lists/*

# Copy published .NET app
COPY --from=dotnet-build /app/publish .

# Copy React build output into wwwroot/ — ASP.NET UseStaticFiles() serves from here
COPY --from=node-build /app/dist ./wwwroot/

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "CloudInvoiceApp.Backend.dll"]
