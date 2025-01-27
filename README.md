# Cloud Invoice Application

A cloud-based application for generating invoices tailored for consultant services. The project features a **React frontend** and an **ASP.NET Minimal API backend**, with Dockerized deployment on AWS.

---

## **Features**
- Social login for users.
- Invoice creation with line items.
- PDF generation for invoices.
- View and filter generated invoices by date and search.
- Dockerized deployment with PostgreSQL database.

---

## **Getting Started**

### **Prerequisites**
- Docker and Docker Compose installed.
- Node.js (for local frontend development).
- .NET 8 SDK (for local backend development).

---

### **Setup**

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/cloud-invoice-app.git
   cd cloud-invoice-app
   ```

2. **Set Up Environment Variables**:
   Create an `.env` file in the root directory and add the following variables:
   ```dotenv
   # PostgreSQL
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=invoice_db

   # Backend
   ASPNETCORE_ENVIRONMENT=Production
   ConnectionStrings__DefaultConnection=Server=database;Port=5432;Database=invoice_db;User Id=postgres;Password=postgres;

   # Frontend
   REACT_APP_API_URL=http://localhost:5000
   ```

3. **Build and Run the Application**:
   Use Docker Compose to build and run the services:
   ```bash
   docker-compose up --build
   ```

4. **Access the Application**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

---

### **Folder Structure**
```
cloud-invoice-app/
├── backend/           # ASP.NET Minimal API
│   ├── src/           # API source code
│   ├── Dockerfile     # Docker configuration for the API
│   └── tests/         # Backend unit tests
├── frontend/          # React application
│   ├── src/           # Frontend source code
│   ├── Dockerfile     # Docker configuration for the UI
│   └── tests/         # Frontend unit tests
├── docker-compose.yml # Compose file for services
├── README.md          # Project documentation
└── .github/           # GitHub Actions for CI/CD
    └── workflows/
        ├── build.yml  # Build and test pipeline
        ├── deploy.yml # Deployment pipeline
```

---

### **Development**

#### **Frontend**
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies and run the app:
   ```bash
   npm install
   npm start
   ```

#### **Backend**
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Run the application:
   ```bash
   dotnet run
   ```

---

### **Deployment**
- The application is designed for deployment on **AWS EC2**.
- Docker Compose is used to orchestrate services.
- Ensure proper security measures (e.g., HTTPS with AWS Certificate Manager).

---

### **Contributing**
1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

---

### **License**
This project is licensed under the MIT License. See the `LICENSE` file for details.
