# Trade Finance Blockchain Explorer

A comprehensive full-stack Trade Finance application featuring a FastAPI backend with JWT authentication, Redis-based token blocklist, and a React + Vite frontend. This project provides a robust authentication system with role-based access control, document management, and trade chain functionality supporting multiple user roles including Bank, Corporate, Auditor, and Admin.

## 🌟 Features

### Backend

-   **FastAPI** - Modern, fast web framework for building APIs
-   **JWT Authentication** - Secure token-based authentication with access and refresh tokens
-   **Role-Based Access Control (RBAC)** - Support for multiple user roles (Bank, Corporate, Auditor, Admin)
-   **Redis Token Blocklist** - Server-side token revocation for secure logout
-   **SQLModel ORM** - SQL database toolkit with Python models
-   **Password Security** - Argon2 hashing for secure password storage
-   **CORS & TrustedHost Middleware** - Security middleware for frontend integration
-   **Database Migrations** - Alembic for schema versioning and migrations
-   **PostgreSQL Support** - Production-ready database backend
-   **Trade Chain Module** - Document upload, management, and verification
-   **Comprehensive Error Handling** - Centralized error handlers with custom exceptions
-   **Startup Health Checks** - Database and Redis connectivity validation

### Frontend

-   **React 19** - Modern UI library for building interactive interfaces
-   **Vite** - Next-generation frontend build tool for lightning-fast development
-   **React Router** - Client-side routing
-   **Tailwind CSS** - Utility-first CSS framework
-   **Axios** - Promise-based HTTP client for API requests
-   **Lucide React** - Beautiful icon library
-   **Dashboard** - Trade Finance Blockchain Explorer landing page
-   **Document Management** - Upload, view, edit, and delete trade documents

## 📋 Prerequisites

-   **Python** 3.9 or higher
-   **Node.js** 16 or higher
-   **PostgreSQL** 12+ (required for production)
-   **Redis** 6+ (required for token blocklist)
-   **Docker** & **Docker Compose** (optional, for containerized services)

## 🚀 Installation

### Backend Setup

1. **Clone the repository** and navigate to the project directory:

```bash
cd Infyspringboard
```

2. **Create a virtual environment**:

```bash
python -m venv .venv
.venv\Scripts\activate  # On Windows
source .venv/bin/activate  # On macOS/Linux
```

3. **Install dependencies**:

```bash
pip install -r requirements.txt
```

4. **Create a `.env` file** in the project root:

```env
POSTGRES_DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/mydatabase
JWT_SECRET_KEY=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
REDIS_URL=redis://localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379
```

5. **Start Redis** (required for token blocklist):

```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# Or ensure Redis is running locally
```

6. **Run database migrations** (if using Alembic):

```bash
alembic upgrade head
```

7. **Start the backend server**:

```bash
uvicorn src:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory**:

```bash
cd frontend
```

2. **Install dependencies**:

```bash
npm install
```

3. **Start the development server**:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Using Docker (Optional)

To run PostgreSQL in Docker:

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the following credentials:

-   **User**: myuser
-   **Password**: mypassword
-   **Database**: mydatabase
-   **Port**: 5432

## 📁 Project Structure

```text
Infyspringboard/
├── src/                          # Backend application code
│   ├── __init__.py              # FastAPI app initialization & router registration
│   ├── config.py                # Environment configuration (Pydantic Settings)
│   ├── errors.py                # Custom exception handlers
│   ├── middleware.py            # CORS and TrustedHost middleware
│   ├── startup_checks.py        # Database and Redis health checks
│   ├── Auth/                    # Authentication module
│   │   ├── router.py            # FastAPI routes for auth endpoints
│   │   ├── service.py           # Authentication business logic
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── utils.py             # JWT and password utilities
│   │   ├── dependency.py        # FastAPI dependencies (get_current_user, role_required)
│   │   └── __init__.py
│   ├── db/                      # Database layer
│   │   ├── database.py          # Database engine and session management
│   │   ├── models.py            # SQLModel database models
│   │   ├── enums.py             # Role, Document, Transaction, Ledger enums
│   │   ├── redis.py             # Redis client for token blocklist
│   │   └── __init__.py
│   ├── trade_chain/             # Trade chain document management module
│   │   ├── router.py            # Document upload/download endpoints
│   │   ├── service.py           # Document management business logic
│   │   ├── schemas.py           # Trade chain request/response models
│   │   ├── utils.py             # Document hashing and file utilities
│   │   └── __init__.py
│   └── tests/                   # Backend test suite
│       ├── conftest.py          # Pytest fixtures
│       ├── test_auth.py         # Authentication endpoint tests
│       └── __init__.py
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx              # Main application component
│   │   ├── Home.jsx             # Home page component
│   │   ├── main.jsx             # Application entry point
│   │   ├── index.css            # Global styles (Tailwind)
│   │   ├── api/                 # API client configuration
│   │   │   └── axios.js         # Axios instance with interceptors
│   │   ├── components/          # Reusable React components
│   │   │   ├── Login.jsx        # Login form component
│   │   │   ├── Signup.jsx       # Registration form component
│   │   │   ├── Dashboard.jsx    # Trade Finance Explorer dashboard
│   │   │   ├── Navbar.jsx       # Navigation bar component
│   │   │   ├── Footer.jsx       # Footer component
│   │   │   ├── ActionBar.jsx    # Action buttons component
│   │   │   ├── DocumentTable.jsx # Document listing table
│   │   │   ├── StatsCard.jsx    # Statistics display card
│   │   │   ├── EditModal.jsx    # Document edit modal
│   │   │   ├── UploadModal.jsx  # Document upload modal
│   │   │   ├── ViewModal.jsx    # Document view modal
│   │   │   └── ui/              # UI components
│   │   │       ├── Card.jsx
│   │   │       ├── Select.jsx
│   │   │       └── StateCard.jsx
│   │   ├── context/             # React context for state management
│   │   │   ├── AuthContext.jsx  # Authentication state provider
│   │   │   └── ProtectedRoute.jsx # Route protection wrapper
│   │   └── hooks/               # Custom React hooks
│   │       └── useDocuments.js  # Document management hook
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── alembic/                     # Database migration scripts
│   ├── env.py
│   ├── script.py.mako
│   └── versions/                # Migration files
├── alembic.ini                  # Alembic configuration
├── docker-compose.yml           # Docker Compose configuration
├── requirements.txt             # Python dependencies
└── Readme.md                    # This file
```

## 🔐 Authentication Flow

1. **Check Email Availability** (`GET /api/auth/check-email`)

    - Verify if email is already registered (public endpoint)
    - Returns: availability status

2. **Registration** (`POST /api/auth/register`)

    - User provides: name, email, password, role, organization name
    - Password validated for strength (8+ chars, uppercase, lowercase, digit, special)
    - Backend hashes password using Argon2
    - User record created in database
    - Returns: user profile data

3. **Login** (`POST /api/auth/login`)

    - User provides: email and password
    - Backend verifies credentials
    - Returns: access token (10 min expiry), refresh token (7 day expiry)

4. **Token Refresh** (`POST /api/auth/refresh`)

    - User provides: refresh token
    - Backend validates token and checks Redis blocklist
    - Revokes old tokens, generates new token pair
    - Returns: new access token and refresh token

5. **Get Current User** (`GET /api/auth/me`)

    - Requires valid access token in Authorization header
    - Returns: authenticated user's profile data

6. **Logout** (`POST /api/auth/logout`)
    - Revokes both access and refresh tokens via Redis blocklist
    - Tokens are immediately invalidated server-side

## 📡 API Endpoints

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint       | Description                              | Auth Required      |
| ------ | -------------- | ---------------------------------------- | ------------------ |
| GET    | `/check-email` | Check if email is available              | No                 |
| POST   | `/register`    | Register a new user                      | No                 |
| POST   | `/login`       | Authenticate user and get tokens         | No                 |
| POST   | `/refresh`     | Get new access token using refresh token | No                 |
| GET    | `/me`          | Get current user profile                 | Yes (Bearer Token) |
| POST   | `/logout`      | Revoke tokens and log out user           | Yes (Bearer Token) |

### Trade Chain Endpoints (`/api/trade_chain`)

| Method | Endpoint         | Description                      | Auth Required | Roles |
| ------ | ---------------- | -------------------------------- | ------------- | ----- |
| POST   | `/upload`        | Upload single/multiple documents | Yes           | All   |
| GET    | `/document`      | Get documents by current user    | Yes           | All   |
| GET    | `/documents`     | Get all documents (admin view)   | Yes           | Admin |
| DELETE | `/document/{id}` | Delete a document                | Yes           | All   |

### Root Endpoints

| Method | Endpoint | Description          | Auth Required |
| ------ | -------- | -------------------- | ------------- |
| GET    | `/`      | API welcome endpoint | No            |

## 👥 User Roles

The system supports four user roles with different access levels:

| Role          | Description                                         |
| ------------- | --------------------------------------------------- |
| **BANK**      | Financial institution users with banking privileges |
| **CORPORATE** | Corporate entity users for business operations      |
| **AUDITOR**   | Auditor users with read-only access for compliance  |
| **ADMIN**     | Administrator users with full system access         |

## 📄 Document Types

The trade chain module supports the following document types:

| Type                            | Description                             |
| ------------------------------- | --------------------------------------- |
| **Letter of Credit (LOC)**      | Financial instrument for trade payments |
| **Invoice**                     | Commercial invoice for goods/services   |
| **Bill of Lading**              | Shipping document for cargo             |
| **Purchase Order (PO)**         | Buyer's order document                  |
| **Certificate of Origin (COO)** | Document certifying goods' origin       |
| **Insurance Certificate**       | Insurance coverage document             |

## 🛠️ Key Technologies

### Backend

-   **FastAPI 0.122.0** - Web framework
-   **SQLModel 0.0.27** - SQL database ORM
-   **Pydantic 2.12.5** - Data validation
-   **python-jose 3.5.0** - JWT token handling
-   **passlib 1.7.4** - Password hashing
-   **argon2-cffi 25.1.0** - Argon2 password algorithm
-   **psycopg2-binary 2.9.11** - PostgreSQL adapter
-   **Alembic 1.17.2** - Database migrations
-   **Uvicorn 0.38.0** - ASGI server

### Frontend

-   **React 19.2.0** - UI library
-   **Vite 7.2.4** - Build tool
-   **React Router 7.9.6** - Client-side routing
-   **Tailwind CSS 4.1.17** - Styling
-   **Axios 1.13.2** - HTTP client
-   **Lucide React 0.555.0** - Icons

## 🔑 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
POSTGRES_DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256

# Redis Configuration (required for token blocklist)
REDIS_URL=redis://localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Redis** (if not already running):

```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

**Terminal 2 - Backend**:

```bash
uvicorn src:app --reload --port 8000
```

**Terminal 3 - Frontend**:

```bash
cd frontend
npm run dev
```

### Production Mode

**Backend**:

```bash
uvicorn src:app --host 0.0.0.0 --port 8000
```

**Frontend**:

```bash
cd frontend
npm run build
npm run preview
```

## 📚 API Documentation

Once the backend is running, visit:

-   **Swagger UI**: `http://localhost:8000/docs`
-   **ReDoc**: `http://localhost:8000/redoc`

## 🗄️ Database

### Database Models

The application uses the following SQLModel database models:

| Model                 | Description                                            |
| --------------------- | ------------------------------------------------------ |
| **Users**             | User accounts with authentication and role information |
| **Documents**         | Trade documents with file references and hashes        |
| **TradeTransactions** | Financial transactions between buyers and sellers      |
| **LedgerEntries**     | Immutable audit trail for document actions             |
| **RiskScores**        | User risk assessment scores and rationale              |
| **AuditLogs**         | Administrative action logs for compliance              |

### PostgreSQL (Production)

-   Requires PostgreSQL server
-   Configure `POSTGRES_DATABASE_URL` in `.env`
-   Use Docker Compose for easy setup

### Redis (Required)

-   Required for token blocklist (JWT revocation)
-   Configure `REDIS_URL`, `REDIS_HOST`, and `REDIS_PORT` in `.env`
-   Startup checks verify Redis connectivity

## 📦 Dependencies Management

### Backend

To update dependencies:

```bash
pip install --upgrade -r requirements.txt
```

### Frontend

To update dependencies:

```bash
cd frontend
npm update
```

## 🔄 Database Migrations

### Create a new migration

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations

```bash
alembic upgrade head
```

### Rollback migration

```bash
alembic downgrade -1
```

## 🧪 Testing

### Backend Testing

```bash
# Run all tests with pytest
pytest src/tests/

# Run with verbose output
pytest src/tests/ -v
```

### Backend Linting

```bash
pylint src/
```

### Frontend Linting

```bash
cd frontend
npm run lint
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License

This project is developed for Infosys Springboard internship as part of the Trade Finance Blockchain Explorer initiative.

## 👨‍💻 Developer

Connect on GitHub: [@Prabhatsingh001](https://github.com/Prabhatsingh001)  
Connect on LinkedIn: [Prabhat Singh](https://www.linkedin.com/in/prabhat-singh-736643287/)

## ⚠️ Security Notes

1. **JWT Secret Key**: Change `JWT_SECRET_KEY` in production to a strong, unique value
2. **Database Credentials**: Use strong passwords for database access
3. **CORS Origins**: In production, specify exact origins instead of using wildcards
4. **Password Requirements**: Minimum 8 characters with uppercase, lowercase, digit, and special character enforced
5. **Token Expiry**: Access tokens expire after 10 minutes, refresh tokens after 7 days
6. **Password Hashing**: Argon2 algorithm used for maximum security
7. **Token Blocklist**: Redis-based JTI blocklist ensures immediate token revocation on logout
8. **TrustedHost Middleware**: Validates request host headers for additional security
9. **Startup Health Checks**: Application verifies database and Redis connectivity before accepting requests

## 🐛 Troubleshooting

### Database Connection Error

-   Ensure PostgreSQL is running
-   Check `POSTGRES_DATABASE_URL` in `.env`
-   Verify database credentials
-   Run `alembic upgrade head` to apply migrations

### Redis Connection Error

-   Ensure Redis is running (`docker ps` to check)
-   Check `REDIS_URL`, `REDIS_HOST`, and `REDIS_PORT` in `.env`
-   Startup health check will fail if Redis is unavailable

### CORS Error

-   Check `allowed_origins` in frontend API configuration
-   Ensure backend CORS middleware includes frontend URL
-   Verify middleware registration in `src/middleware.py`

### Token Expiry Issues

-   Access tokens expire after 10 minutes, refresh using `/api/auth/refresh`
-   Refresh tokens expire after 7 days
-   Check token expiration times in `src/Auth/utils.py`
-   Verify token is not in Redis blocklist (logged out)

### Frontend Build Issues

```bash
cd frontend
rm -rf node_modules
npm install
npm run build
```

### Startup Health Check Failures

-   Application will not start if database or Redis is unavailable
-   Check logs for specific connection errors
-   Verify all environment variables are set correctly

## 📞 Support

For issues or questions, please open an issue on the GitHub repository.

---

**Happy Coding!**
