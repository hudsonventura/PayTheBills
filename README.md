# PayTheBills 💳

> Modern, self-contained, and portable system for managing and tracking bills, due dates, and financial recurrences.

*Read this in other languages: [Português (README-BR.md)](README-BR.md)*

---

## 🎯 System Objectives

### What is PayTheBills?
**PayTheBills** is a personal project to solve a recurring problem. It is a comprehensive personal and business financial management application focused on controlling bills, invoices, and recurring expenses. Built on the principles of **Clean Architecture**, the system unifies bill scheduling, due date forecasting, and payment execution history into a streamlined and agile user experience.

### What problem does it solve?
- **Due Date Tracking:** Forecasts and tracks future due dates based on configured frequencies (one-time, daily, weekly, monthly, yearly, or custom intervals).
- **Financial Visibility:** Clearly presents paid and pending bills along with execution history, actual paid amounts, and reference due dates.
- **Deployment Simplicity:** Eliminates complex setups involving multiple standalone servers or external database instances. The system is **fully portable**: with a single Docker command, both frontend and backend spin up unified with persistent local data storage via SQLite.

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/) installed (recommended for containerized execution), **or**
- [.NET 10 SDK](https://dotnet.microsoft.com/) and [Node.js 22+](https://nodejs.org/) (for local bare-metal development).

---

### Running with Docker (Recommended)

The project is designed for total portability in a single, unified container:

1. Clone the repository:
   ```bash
   git clone https://github.com/hudsonventura/PayTheBills.git
   cd PayTheBills
   ```

2. Start the application with Docker Compose:
   ```bash
   docker compose up -d
   ```

3. Open the application in your browser:
   - **Primary Web UI & API:** [http://localhost:5000](http://localhost:5000)
   - **Alternative Port (Vite default):** [http://localhost:5173](http://localhost:5173)

4. **Default Credentials (Automatic Database Seed):**
   - **Username / Email:** `admin`
   - **Password:** `admin`

> 💾 **Data Persistence:** The SQLite database is created and persisted on the host machine inside `./data/paythebills.db`. Your data safely persists across container restarts, removals, or image updates.

---

### Running in Local Development (Without Docker)

If you prefer running the backend and frontend separately during development:

#### 1. Backend (.NET 10)
```bash
cd server
dotnet restore
dotnet run
```
*The server will start listening on `http://localhost:5000` and create the SQLite database in `server/data/paythebills.db`.*

#### 2. Frontend (React + Vite)
```bash
cd client
npm install
npm run dev
```
*Vite will start the development server on `http://localhost:5173`.*

#### 3. Running Automated Tests
```bash
dotnet test
```

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend** | .NET 10 / C# 14 | High-performance ASP.NET Core Minimal APIs |
| **Database** | SQLite via EF Core | Entity Framework Core with native migrations |
| **Identifiers** | SnowflakeGuid | Time-ordered, sequential, and unique 64-bit GUIDs |
| **Security** | PBKDF2 + Cryptographic Salt | Hashing with 100,000 SHA-256 iterations and 16-character random salts |
| **Authentication** | JWT (JSON Web Tokens) | Stateless token-based authentication via Bearer scheme |
| **Frontend** | React 19 + TypeScript | Single Page Application (SPA) with static typing and native reactivity |
| **Build & Styling** | Vite + Tailwind CSS | Ultra-fast bundling with utility-first modern CSS |
| **Icons** | Lucide React | Clean, scalable, and consistent icon set |
| **Containerization** | Docker Multi-Stage | Unified image compiling both client and server into a single runtime |

---

## 🏛️ Architecture and Design Patterns

The PayTheBills backend is engineered following **Clean Architecture** guidelines, ensuring domain rules remain decoupled and agnostic to persistence and presentation details.

```
server/
├── Domain/                   # Enterprise Business Rules & Entities
│   ├── Entities/             # User, Bill, BillExecution
│   ├── Enums/                # Frequency (Once, Daily, Monthly, etc.)
│   └── Services/             # RecurrenceCalculator (Pure domain due-date calculations)
├── Application/              # Use Cases and Application Contracts
│   ├── DTOs/                 # Request and Response transfer models
│   ├── Interfaces/           # IAppDbContext, IPasswordHasher, ITokenService
│   └── UseCases/             # AuthUseCases, BillUseCases
├── Infrastructure/           # External I/O and Persistence Implementation
│   ├── Persistence/          # AppDbContext, EF Core Configurations, SQLite Migrations
│   └── Security/             # Pbkdf2PasswordHasher, JwtTokenService
├── Endpoints/                # Presentation / Transport Layer (Minimal APIs)
│   ├── AuthEndpoints.cs
│   └── BillEndpoints.cs
└── Extensions/               # Pipeline Configuration & Dependency Injection Setup
```

### Key Design Patterns Applied

1. **Clean Architecture / Dependency Inversion Principle (DIP):**
   - The `Domain` and `Application` layers have zero dependencies on SQLite, PostgreSQL, or ASP.NET Core.
   - Practical demonstration: migrating the database from PostgreSQL to SQLite required **zero** changes to domain logic and use cases, strictly touching only the infrastructure and configuration layers.

2. **Use Case Pattern (Application Services):**
   - Business operations (`AuthUseCases`, `BillUseCases`) centralize orchestration logic, keeping HTTP endpoints lightweight and focused purely on request mapping, validation, and status codes.

3. **Repository / Unit of Work Pattern (via EF Core DbContext):**
   - The `IAppDbContext` interface abstracts data access, facilitating testability without requiring a physical database instance.

4. **Domain Service Pattern (`RecurrenceCalculator`):**
   - Recurring bill calculation logic is encapsulated within a pure domain service backed by thorough unit tests.

5. **Strategy / Provider Pattern for Security:**
   - The `IPasswordHasher` abstraction decouples hashing and verification implementations from use cases.

6. **Single Point of Failure / Centralized API Client (Frontend):**
   - On the React frontend, all network requests flow through a unified `client.ts` utility that centrally manages base URLs, JWT token injection, error handling, and session expiration.

7. **Multi-Stage Build Pattern (Docker):**
   - The `Dockerfile` uses build stages (`client-builder`, `server-builder`, and `runtime`), producing a compact and hardened runtime container that serves both the REST API and the static SPA assets through Kestrel.

---

## 🔒 Security Implementations

- **Cryptographic Password Salt (BR-AUTH-02):**
  - Every user account receives a uniquely generated 16-character salt containing at least 6 special characters.
  - Password hashing derives keys via `PBKDF2` (`HMACSHA256`) with 100,000 iterations.
  - Password verification uses `CryptographicOperations.FixedTimeEquals` to prevent side-channel timing attacks.
- **Tenant & User Data Isolation:**
  - All bill and payment execution queries are strictly scoped to the authenticated `UserId` extracted from validated JWT claims.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
