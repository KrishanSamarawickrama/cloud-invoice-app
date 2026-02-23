# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files and restore
COPY CloudInvoiceApp.Backend/CloudInvoiceApp.Backend.csproj CloudInvoiceApp.Backend/
COPY CloudInvoiceApp.ServiceDefaults/CloudInvoiceApp.ServiceDefaults.csproj CloudInvoiceApp.ServiceDefaults/
RUN dotnet restore CloudInvoiceApp.Backend/CloudInvoiceApp.Backend.csproj

# Copy source and publish
COPY CloudInvoiceApp.Backend/ CloudInvoiceApp.Backend/
COPY CloudInvoiceApp.ServiceDefaults/ CloudInvoiceApp.ServiceDefaults/
RUN dotnet publish CloudInvoiceApp.Backend/CloudInvoiceApp.Backend.csproj -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# libgdiplus needed by QuestPDF for PDF generation
RUN apt-get update && apt-get install -y --no-install-recommends libgdiplus && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "CloudInvoiceApp.Backend.dll"]
