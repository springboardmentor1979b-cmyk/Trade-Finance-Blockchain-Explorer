# Trade Finance Blockchain Explorer

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-0.122.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Alpine-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**A comprehensive full-stack Trade Finance platform with blockchain-inspired immutable ledger tracking, document management, risk assessment, and multi-role access control.**

[Features](#-features) • [Quick Start](#-quick-start) • [API Docs](#-api-documentation) • [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Environment Configuration](#-environment-configuration)
- [API Endpoints](#-api-endpoints)
- [Database Models](#-database-models)
- [User Roles & Permissions](#-user-roles--permissions)
- [Frontend Structure](#-frontend-structure)
- [Testing](#-testing)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

Trade Finance Blockchain Explorer is a modern, enterprise-grade trade finance management system designed to streamline document workflows, transaction tracking, and compliance auditing. Built with a FastAPI backend and React frontend, it provides:

- **Immutable Ledger Tracking**: Blockchain-inspired audit trail for all document actions
- **Multi-Party Support**: Distinct workflows for Banks, Corporates, Auditors, and Admins
- **Secure Authentication**: JWT with Redis-backed token blocklist for immediate revocation
- **Risk Assessment**: Automated risk scoring with rationale tracking
- **Comprehensive Auditing**: Full administrative action logging for compliance

---

## ✨ Features

### Backend Capabilities

| Feature                       | Description                                                   |
| ----------------------------- | ------------------------------------------------------------- |
| **FastAPI + SQLModel**        | High-performance async API with PostgreSQL integration        |
| **JWT Authentication**        | Access tokens (10 min) + httpOnly refresh cookies (7 days)    |
| **Redis Token Blocklist**     | Immediate token revocation on logout with JTI tracking        |
| **Role-Based Access Control** | Fine-grained permissions for Bank, Corporate, Auditor, Admin  |
| **Trade Chain Module**        | Document upload with SHA-256 hashing and duplicate detection  |
| **Ledger Module**             | Immutable action tracking with pagination and filtering       |
| **Transaction Management**    | Buyer/seller trade transactions with status workflow          |
| **Risk Scores**               | User risk assessment with score and rationale                 |
| **Audit Logs**                | Complete administrative action history                        |
| **Password Security**         | Argon2 hashing with OTP-based password reset                  |
| **Startup Health Checks**     | Validates DB and Redis connectivity before accepting requests |

### Frontend Capabilities

| Feature                    | Description                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------- |
| **React 19 + Vite**        | Modern SPA with hot module replacement                                             |
| **Protected Routing**      | Role-based route protection with automatic redirects                               |
| **Auto Token Refresh**     | Seamless token rotation via Axios interceptors                                     |
| **Glassmorphism UI**       | Modern glass-effect design with Tailwind CSS                                       |
| **Toast Notifications**    | Real-time feedback with react-hot-toast                                            |
| **Multi-Module Dashboard** | Unified interface for documents, ledger, transactions, risk scores, and audit logs |
| **CRUD Modals**            | Upload, view, edit, and delete modals for each module                              |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  React 19 + Vite + Tailwind CSS + React Router + Axios                  │
│  └── AuthContext → ProtectedRoute → Dashboard Components                │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ HTTP/HTTPS (CORS enabled)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FASTAPI APPLICATION                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    Auth     │  │ Trade Chain │  │   Ledger    │  │ Transaction │     │
│  │   Module    │  │   Module    │  │   Module    │  │   Module    │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │                │            │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐     │
│  │                    SQLModel ORM Layer                          │     │
│  └────────────────────────────┬───────────────────────────────────┘     │
│  ┌─────────────┐  ┌───────────┴───────────┐  ┌─────────────────────┐    │
│  │ Risk Scores │  │     Audit Logs        │  │  Startup Checks     │    │
│  │   Module    │  │       Module          │  │  (DB + Redis)       │    │
│  └─────────────┘  └───────────────────────┘  └─────────────────────┘    │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           ▼                       ▼                       ▼
    ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
    │ PostgreSQL  │         │    Redis    │         │   uploads/  │
    │   (Data)    │         │ (Blocklist) │         │ (Documents) │
    └─────────────┘         └─────────────┘         └─────────────┘
```

### Project Structure

```
Trade-Finance-Blockchain-Explorer/
├── src/                              # Backend application
│   ├── __init__.py                  # FastAPI app initialization
│   ├── config.py                    # Pydantic settings configuration
│   ├── errors.py                    # Custom exception handlers
│   ├── middleware.py                # CORS and TrustedHost middleware
│   ├── startup_checks.py            # Database and Redis health checks
│   │
│   ├── Auth/                        # Authentication module
│   │   ├── router.py                # Auth API endpoints
│   │   ├── service.py               # Authentication business logic
│   │   ├── schemas.py               # Request/response models
│   │   ├── utils.py                 # JWT and password utilities
│   │   └── dependency.py            # get_current_user, role_required
│   │
│   ├── db/                          # Database layer
│   │   ├── database.py              # Engine and session management
│   │   ├── models.py                # SQLModel ORM models
│   │   ├── enums.py                 # Role, Document, Transaction enums
│   │   ├── redis.py                 # Redis client for blocklist
│   │   └── id_utils.py              # ID generation utilities
│   │
│   ├── trade_chain/                 # Document management module
│   │   ├── router.py                # Upload/download endpoints
│   │   ├── service.py               # Document business logic
│   │   ├── schemas.py               # Trade chain models
│   │   ├── utils.py                 # File hashing utilities
│   │   └── validators.py            # Document validation
│   │
│   ├── ledger/                      # Immutable ledger module
│   │   ├── router.py                # Ledger CRUD endpoints
│   │   ├── service.py               # Ledger business logic
│   │   └── schemas.py               # Ledger models
│   │
│   ├── trade_transaction/           # Transaction management module
│   │   ├── router.py                # Transaction endpoints
│   │   ├── service.py               # Transaction business logic
│   │   ├── schemas.py               # Transaction models
│   │   ├── utils.py                 # Transaction utilities
│   │   └── validators.py            # Transaction validation
│   │
│   ├── risk_scores/                 # Risk assessment module
│   │   ├── router.py                # Risk score endpoints
│   │   ├── service.py               # Risk calculation logic
│   │   └── schemas.py               # Risk score models
│   │
│   ├── audit_logs/                  # Audit logging module
│   │   ├── router.py                # Audit log endpoints
│   │   ├── service.py               # Audit logging logic
│   │   └── schemas.py               # Audit log models
│   │
│   └── tests/                       # Test suite
│       ├── conftest.py              # Pytest fixtures
│       ├── test_auth.py             # Authentication tests
│       ├── test_trade_chain.py      # Trade chain tests
│       ├── test_ledger.py           # Ledger tests
│       └── test_api_infra.py        # Infrastructure tests
│
├── frontend/                        # React frontend application
│   ├── src/
│   │   ├── App.jsx                  # Root component with layout
│   │   ├── Home.jsx                 # Protected dashboard home
│   │   ├── main.jsx                 # Entry point with routing
│   │   ├── index.css                # Tailwind global styles
│   │   │
│   │   ├── api/                     # API client layer
│   │   │   ├── axios.js             # Axios with interceptors
│   │   │   └── services.js          # API service functions
│   │   │
│   │   ├── context/                 # React context providers
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── ProtectedRoute.jsx   # Route guards
│   │   │
│   │   ├── components/              # UI components
│   │   │   ├── Dashboard.jsx        # Main landing page
│   │   │   ├── Login.jsx            # Login form
│   │   │   ├── Signup.jsx           # Registration form
│   │   │   ├── ForgotPassword.jsx   # Password reset flow
│   │   │   ├── Navbar.jsx           # Navigation header
│   │   │   ├── Footer.jsx           # Page footer
│   │   │   │
│   │   │   ├── DocumentTable.jsx    # Trade chain documents
│   │   │   ├── ActionBar.jsx        # Document actions
│   │   │   ├── UploadModal.jsx      # Document upload
│   │   │   ├── ViewModal.jsx        # Document viewer
│   │   │   ├── EditModal.jsx        # Document editor
│   │   │   │
│   │   │   ├── LedgerPage.jsx       # Ledger management
│   │   │   ├── LedgerTable.jsx      # Ledger entries table
│   │   │   ├── LedgerActionBar.jsx  # Ledger actions
│   │   │   │
│   │   │   ├── TradeTransactionsPage.jsx   # Transaction management
│   │   │   ├── TradeTransactionsTable.jsx  # Transactions table
│   │   │   │
│   │   │   ├── RiskScoresPage.jsx   # Risk score management
│   │   │   ├── RiskScoresTable.jsx  # Risk scores table
│   │   │   │
│   │   │   ├── AuditLogsPage.jsx    # Audit log viewer
│   │   │   ├── AuditLogsTable.jsx   # Audit logs table
│   │   │   │
│   │   │   └── ui/                  # Reusable UI primitives
│   │   │       ├── Card.jsx
│   │   │       ├── Select.jsx
│   │   │       └── StateCard.jsx
│   │   │
│   │   └── hooks/                   # Custom React hooks
│   │
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # NPM dependencies
│   └── vite.config.js               # Vite configuration
│
├── alembic/                         # Database migrations
│   ├── env.py                       # Alembic environment
│   └── versions/                    # Migration scripts
│
├── uploads/                         # Document storage
│   └── documents/                   # Uploaded files
│
├── alembic.ini                      # Alembic configuration
├── docker-compose.yml               # Docker services
├── requirements.txt                 # Python dependencies
└── README.md                        # This file
```

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Purpose                 |
| ----------- | ------- | ----------------------- |
| Python      | 3.9+    | Backend runtime         |
| Node.js     | 16+     | Frontend tooling        |
| PostgreSQL  | 12+     | Primary database        |
| Redis       | 6+      | Token blocklist         |
| Docker      | Latest  | Container orchestration |

### Installation

#### 1. Clone and Setup Virtual Environment

```bash
git clone https://github.com/springboardmentor1979b-cmyk/Trade-Finance-Blockchain-Explorer.git
cd Trade-Finance-Blockchain-Explorer

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

#### 2. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

#### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# PostgreSQL Database
POSTGRES_DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/mydatabase

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### 4. Start Infrastructure Services

```bash
# Start PostgreSQL and Redis via Docker
docker-compose up -d
```

This starts:

- **PostgreSQL 17** on port `5432`
- **Redis Alpine** on port `6379`

#### 5. Run Database Migrations

```bash
alembic upgrade head
```

#### 6. Start Backend Server

```bash
uvicorn src:app --reload --port 8000
```

Backend available at `http://localhost:8000`

#### 7. Start Frontend Development Server

```bash
cd frontend
npm install
npm run dev
```

Frontend available at `http://localhost:5173`

---

## ⚙ Environment Configuration

| Variable                | Required | Description                  | Example                                    |
| ----------------------- | -------- | ---------------------------- | ------------------------------------------ |
| `POSTGRES_DATABASE_URL` | ✅       | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET_KEY`        | ✅       | Secret key for JWT signing   | `your-256-bit-secret`                      |
| `JWT_ALGORITHM`         | ✅       | JWT signing algorithm        | `HS256`                                    |
| `REDIS_URL`             | ✅       | Full Redis connection URL    | `redis://localhost:6379/0`                 |
| `REDIS_HOST`            | ✅       | Redis server hostname        | `localhost`                                |
| `REDIS_PORT`            | ✅       | Redis server port            | `6379`                                     |

### Frontend Environment (Optional)

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint          | Description                  | Auth              |
| ------ | ----------------- | ---------------------------- | ----------------- |
| `GET`  | `/check-email`    | Check email availability     | ❌                |
| `POST` | `/register`       | Create new user account      | ❌                |
| `POST` | `/login`          | Authenticate and get tokens  | ❌                |
| `POST` | `/refresh`        | Rotate access/refresh tokens | 🍪 Refresh cookie |
| `GET`  | `/me`             | Get current user profile     | ✅ Access token   |
| `POST` | `/logout`         | Revoke tokens and logout     | ✅ Access token   |
| `POST` | `/forgotpassword` | Request password reset OTP   | ❌                |
| `POST` | `/verify-otp`     | Validate password reset OTP  | ❌                |
| `POST` | `/reset-password` | Set new password after OTP   | ❌                |

### Trade Chain Documents (`/api/trade_chain`)

| Method   | Endpoint         | Description                  | Allowed Roles   |
| -------- | ---------------- | ---------------------------- | --------------- |
| `POST`   | `/upload`        | Upload documents (multipart) | Bank, Corporate |
| `GET`    | `/document`      | Get own documents            | Bank, Corporate |
| `GET`    | `/documents`     | Get all documents            | Admin, Auditor  |
| `PUT`    | `/document/{id}` | Update document              | Admin, Auditor  |
| `DELETE` | `/document/{id}` | Delete document              | Admin, Auditor  |

**Document Types**: `letter_of_credit`, `invoice`, `bill_of_lading`, `purchase_order`, `certificate_of_origin`, `insurance_certificate`

### Ledger Entries (`/api/ledger`)

| Method   | Endpoint         | Description                 | Allowed Roles   |
| -------- | ---------------- | --------------------------- | --------------- |
| `POST`   | `/entry`         | Create ledger entry         | Bank, Corporate |
| `GET`    | `/records/admin` | Get all records (paginated) | Admin, Auditor  |
| `GET`    | `/records/user`  | Get own records (paginated) | Bank, Corporate |
| `PATCH`  | `/records/{id}`  | Update ledger action        | Admin, Auditor  |
| `DELETE` | `/records/{id}`  | Delete ledger entry         | Admin, Auditor  |

**Ledger Actions**: `issued`, `amended`, `shipped`, `received`, `paid`, `cancelled`, `verified`

### Trade Transactions (`/api/transaction`)

| Method  | Endpoint       | Description                             | Allowed Roles     |
| ------- | -------------- | --------------------------------------- | ----------------- |
| `POST`  | `/`            | Create transaction                      | Bank, Corporate   |
| `GET`   | `/`            | List transactions (filtered, paginated) | All authenticated |
| `GET`   | `/{id}`        | Get transaction details                 | All authenticated |
| `PATCH` | `/{id}/status` | Update transaction status               | Admin, Auditor    |

**Transaction Statuses**: `pending`, `in_progress`, `completed`, `disputed`

### Risk Scores (`/api/risk_scores`)

| Method   | Endpoint | Description                    | Allowed Roles     |
| -------- | -------- | ------------------------------ | ----------------- |
| `POST`   | `/`      | Create risk score              | Admin, Auditor    |
| `GET`    | `/`      | Get all risk scores (filtered) | Admin, Auditor    |
| `GET`    | `/my`    | Get own risk scores            | All authenticated |
| `PATCH`  | `/{id}`  | Update risk score              | Admin, Auditor    |
| `DELETE` | `/{id}`  | Delete risk score              | Admin, Auditor    |

### Audit Logs (`/api/audit_logs`)

| Method | Endpoint | Description                   | Allowed Roles  |
| ------ | -------- | ----------------------------- | -------------- |
| `POST` | `/`      | Create audit log              | Admin          |
| `GET`  | `/`      | Get all audit logs (filtered) | Admin, Auditor |
| `GET`  | `/my`    | Get own audit logs            | Admin          |

---

## 📊 Database Models

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Users       │     │   Documents     │     │ LedgerEntries   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │◄────│ owner_id (FK)   │     │ id (PK)         │
│ email           │     │ id (PK)         │◄────│ document_id(FK) │
│ name            │     │ doc_type        │     │ actor_id (FK)───┼──►Users
│ password_hash   │     │ doc_number      │     │ action          │
│ role            │     │ file_url        │     │ metadatav       │
│ org_name        │     │ hash            │     │ created_at      │
│ created_at      │     │ issued_at       │     └─────────────────┘
└─────────────────┘     │ created_at      │
        │               └─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│TradeTransactions│     │  RiskScores     │     │   AuditLogs     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ buyer_id (FK)───┼──►  │ user_id (FK)────┼──►  │ admin_id (FK)───┼──►Users
│ seller_id (FK)──┼──►  │ score           │     │ action          │
│ amount          │     │ rationale       │     │ target_type     │
│ currency        │     │ last_updated    │     │ target_id       │
│ status          │     └─────────────────┘     │ timestamp       │
│ created_at      │                             └─────────────────┘
│ updated_at      │
└─────────────────┘
```

---

## 👥 User Roles & Permissions

| Permission                | Bank | Corporate | Auditor | Admin |
| ------------------------- | :--: | :-------: | :-----: | :---: |
| Upload documents          |  ✅  |    ✅     |   ❌    |  ❌   |
| View own documents        |  ✅  |    ✅     |   ❌    |  ❌   |
| View all documents        |  ❌  |    ❌     |   ✅    |  ✅   |
| Edit/Delete documents     |  ❌  |    ❌     |   ✅    |  ✅   |
| Create ledger entries     |  ✅  |    ✅     |   ❌    |  ❌   |
| View all ledger records   |  ❌  |    ❌     |   ✅    |  ✅   |
| Manage ledger records     |  ❌  |    ❌     |   ✅    |  ✅   |
| Create transactions       |  ✅  |    ✅     |   ❌    |  ❌   |
| Update transaction status |  ❌  |    ❌     |   ✅    |  ✅   |
| Manage risk scores        |  ❌  |    ❌     |   ✅    |  ✅   |
| View audit logs           |  ❌  |    ❌     |   ✅    |  ✅   |
| Create audit logs         |  ❌  |    ❌     |   ❌    |  ✅   |

---

## 🎨 Frontend Structure

### Routes

| Path              | Component      | Access    | Description                |
| ----------------- | -------------- | --------- | -------------------------- |
| `/`               | Dashboard      | Public    | Landing page with overview |
| `/login`          | Login          | Public    | User login form            |
| `/signup`         | Signup         | Public    | User registration form     |
| `/forgotpassword` | ForgotPassword | Public    | Password reset flow        |
| `/dashboard`      | Home           | Protected | Main application dashboard |
| `/unauthorized`   | Unauthorised   | Public    | Access denied page         |

### Authentication Flow

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Login  │────►│ AuthContext │────►│ localStorage│────►│ ProtectedRt │
│  Form   │     │   login()   │     │ access_token│     │   Check     │
└─────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                │
     ┌────────────────────────────────────────────────────────┘
     ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 401 Response    │────►│ Axios Intercept │────►│ /api/auth/      │
│ (Token Expired) │     │ Auto Refresh    │     │ refresh         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
pytest src/tests/ -v

# Run specific test file
pytest src/tests/test_auth.py -v

# Run with coverage
pytest src/tests/ --cov=src --cov-report=html
```

### Available Test Suites

| File                             | Coverage                 |
| -------------------------------- | ------------------------ |
| `test_auth.py`                   | Authentication endpoints |
| `test_trade_chain.py`            | Document management      |
| `test_ledger.py`                 | Ledger operations        |
| `test_api_infra.py`              | API infrastructure       |
| `test_id_utils.py`               | ID generation utilities  |
| `test_string_ids_integration.py` | String ID integration    |

### Linting

```bash
# Backend
pylint src/

# Frontend
cd frontend && npm run lint
```

---

## 🔐 Security

### Authentication Security

| Feature               | Implementation                                      |
| --------------------- | --------------------------------------------------- |
| Password Hashing      | Argon2 (via argon2-cffi)                            |
| Password Requirements | 8+ chars, uppercase, lowercase, digit, special char |
| Access Token Expiry   | 10 minutes                                          |
| Refresh Token Expiry  | 7 days                                              |
| Token Storage         | Access in localStorage, Refresh in httpOnly cookie  |
| Token Revocation      | Redis JTI blocklist                                 |

### API Security

| Feature          | Implementation                        |
| ---------------- | ------------------------------------- |
| CORS             | Restricted to `http://localhost:5173` |
| TrustedHost      | Validates `localhost`, `127.0.0.1`    |
| Rate Limiting    | Recommended for production            |
| Input Validation | Pydantic models                       |

### Production Checklist

- [ ] Change `JWT_SECRET_KEY` to a strong, unique value
- [ ] Update CORS `allow_origins` to production domain
- [ ] Update TrustedHost `allowed_hosts` to production domain
- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Set up log aggregation
- [ ] Configure proper database connection pooling

---

## 🔧 Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Verify connection string in .env
# Ensure alembic migrations are applied
alembic upgrade head
```

### Redis Connection Failed

```bash
# Check Redis is running
docker ps | grep redis

# Test Redis connection
redis-cli ping  # Should return PONG
```

### CORS Errors

- Verify `allow_origins` in `src/middleware.py` includes your frontend URL
- Check browser console for specific CORS error details

### Token Expired / 401 Errors

- Access tokens expire after 10 minutes
- Frontend automatically refreshes tokens
- Check if refresh token is in Redis blocklist (logged out)

### Frontend Build Issues

```bash
cd frontend
rm -rf node_modules
npm install
npm run build
```

### Startup Health Check Failures

- Application blocks startup if PostgreSQL or Redis is unavailable
- Check Docker containers are running
- Verify environment variables are set correctly

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript/React
- Write tests for new features
- Update documentation as needed

---

## 📄 License

This project is developed for **Infosys Springboard Internship** and is not licensed for public use.

---

## 📬 Support

For issues or questions, please [open an issue](https://github.com/springboardmentor1979b-cmyk/Trade-Finance-Blockchain-Explorer/issues) on the GitHub repository.
