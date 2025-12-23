# Infosys Springboard Internship Project

A comprehensive full-stack application featuring a FastAPI backend with JWT authentication and a React + Vite frontend. This project provides a robust authentication system with role-based access control, supporting multiple user roles including Bank, Corporate, Auditor, and Admin.

## 🌟 Features

### Backend

- **FastAPI** - Modern, fast web framework for building APIs
- **JWT Authentication** - Secure token-based authentication with access and refresh tokens
- **Role-Based Access Control (RBAC)** - Support for multiple user roles (Bank, Corporate, Auditor, Admin)
- **SQLModel ORM** - SQL database toolkit with Python models
- **Password Security** - Argon2 hashing for secure password storage
- **CORS Support** - Cross-Origin Resource Sharing for frontend integration
- **Database Migrations** - Alembic for schema versioning and migrations
- **PostgreSQL & SQLite** - Support for multiple database backends

### Frontend

- **React 19** - Modern UI library for building interactive interfaces
- **Vite** - Next-generation frontend build tool for lightning-fast development
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - Promise-based HTTP client for API requests
- **Lucide React** - Beautiful icon library

## 📋 Prerequisites

- **Python** 3.9 or higher
- **Node.js** 16 or higher
- **PostgreSQL** 12+ (optional, SQLite is used by default)
- **Docker** & **Docker Compose** (optional, for containerized PostgreSQL)

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
DATABASE_URL=sqlite:///database.db
POSTGRES_DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/mydatabase
USE_POSTGRES=false
JWT_SECRET_KEY=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
```

5. **Run database migrations** (if using Alembic):

```bash
alembic upgrade head
```

6. **Start the backend server**:

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

- **User**: myuser
- **Password**: mypassword
- **Database**: mydatabase
- **Port**: 5432

## 📁 Project Structure

```text
Infyspringboard/
├── src/                          # Backend application code
│   ├── __init__.py              # FastAPI app initialization
│   ├── config.py                # Environment configuration
│   ├── database.py              # Database setup and session management
│   ├── models.py                # SQLModel database models
│   └── Auth/                    # Authentication module
│       ├── authService.py       # Authentication business logic
│       ├── router.py            # FastAPI routes for auth endpoints
│       ├── schemas.py           # Pydantic request/response models
│       ├── utils.py             # JWT and password utilities
│       ├── dependency.py        # FastAPI dependencies
│       └── __init__.py
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Home.jsx
│   │   ├── main.jsx
│   │   ├── api/                 # API client configuration
│   │   │   └── axios.js
│   │   ├── components/          # Reusable React components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ui/              # UI components
│   │   │       └── Card.jsx
│   │   └── context/             # React context for state management
│   │       ├── AuthContext.jsx
│   │       └── ProtectedRoute.jsx
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

1. **Registration** (`POST /api/auth/register`)
   - User provides: name, email, password, role, organization name
   - Backend hashes password using Argon2
   - User record created in database
   - Returns: user profile data

2. **Login** (`POST /api/auth/login`)
   - User provides: email and password
   - Backend verifies credentials
   - Returns: access token (15 min expiry), refresh token (7 day expiry)

3. **Token Refresh** (`POST /api/auth/refresh`)
   - User provides: refresh token
   - Backend validates and generates new token pair
   - Returns: new access token and refresh token

4. **Get Current User** (`GET /api/auth/me`)
   - Requires valid access token in Authorization header
   - Returns: authenticated user's profile data

5. **Logout** (`POST /api/auth/logout`)
   - Placeholder endpoint for logout functionality
   - Token invalidation handled client-side

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Authenticate user and get tokens | No |
| POST | `/api/auth/refresh` | Get new access token using refresh token | No |
| GET | `/api/auth/me` | Get current user profile | Yes (Bearer Token) |
| POST | `/api/auth/logout` | Log out user | No |
| GET | `/` | API welcome endpoint | No |

## 👥 User Roles

The system supports four user roles with different access levels:

| Role | Description |
|------|-------------|
| **BANK** | Bank institution users |
| **CORPORATE** | Corporate organization users |
| **AUDITOR** | Auditor users for compliance and auditing |
| **ADMIN** | Administrator users with full system access |

## 🛠️ Key Technologies

### Backend

- **FastAPI 0.122.0** - Web framework
- **SQLModel 0.0.27** - SQL database ORM
- **Pydantic 2.12.5** - Data validation
- **python-jose 3.5.0** - JWT token handling
- **passlib 1.7.4** - Password hashing
- **argon2-cffi 25.1.0** - Argon2 password algorithm
- **psycopg2-binary 2.9.11** - PostgreSQL adapter
- **Alembic 1.17.2** - Database migrations
- **Uvicorn 0.38.0** - ASGI server

### Frontend

- **React 19.2.0** - UI library
- **Vite 7.2.4** - Build tool
- **React Router 7.9.6** - Client-side routing
- **Tailwind CSS 4.1.17** - Styling
- **Axios 1.13.2** - HTTP client
- **Lucide React 0.555.0** - Icons

## 🔑 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL=sqlite:///database.db
POSTGRES_DATABASE_URL=postgresql://user:password@host:5432/database
USE_POSTGRES=false

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend**:

```bash
uvicorn src:app --reload --port 8000
```

**Terminal 2 - Frontend**:

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

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🗄️ Database

### SQLite (Default)

- File-based database: `database.db`
- No additional setup required
- Suitable for development

### PostgreSQL (Production)

- Requires PostgreSQL server
- Configure `POSTGRES_DATABASE_URL` in `.env`
- Set `USE_POSTGRES=true`
- Use Docker Compose for easy setup

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

This project is developed for Infosys Springboard internship.

## 👨‍💻 Developer

Connect on GitHub: [@Prabhatsingh001](https://github.com/Prabhatsingh001)

## ⚠️ Security Notes

1. **JWT Secret Key**: Change `JWT_SECRET_KEY` in production to a strong, unique value
2. **Database Credentials**: Use strong passwords for database access
3. **CORS Origins**: In production, specify exact origins instead of using wildcards
4. **Password Requirements**: Minimum 8 characters enforced
5. **Token Expiry**: Access tokens expire after 15 minutes, refresh tokens after 7 days
6. **Password Hashing**: Argon2 algorithm used for maximum security

## 🐛 Troubleshooting

### Database Connection Error

- Ensure PostgreSQL is running (if using PostgreSQL)
- Check `DATABASE_URL` or `POSTGRES_DATABASE_URL` in `.env`
- Verify database credentials

### CORS Error

- Check `allowed_origins` in frontend API configuration
- Ensure backend CORS middleware includes frontend URL

### Token Expiry Issues

- Refresh tokens when access token expires
- Check token expiration times in `src/Auth/utils.py`

### Frontend Build Issues

```bash
cd frontend
rm -rf node_modules
npm install
npm run build
```

## 📞 Support

For issues or questions, please open an issue on the GitHub repository.

---

**Happy Coding!**
