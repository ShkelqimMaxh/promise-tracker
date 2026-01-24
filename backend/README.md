# MyPromises Backend

Backend API server for MyPromises application with full authentication system.

## Features

- ✅ User registration and login
- ✅ JWT access tokens (15 minutes expiry)
- ✅ Refresh tokens (7 days expiry)
- ✅ Token refresh endpoint
- ✅ Protected routes with authentication middleware
- ✅ Password hashing with bcrypt
- ✅ PostgreSQL database integration

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with the following variables:
```env
# Server Configuration
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=promise_tracker
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:8081
```

3. Make sure you have PostgreSQL installed and create a database:
```sql
CREATE DATABASE promise_tracker;
```

4. Update the `.env` file with your PostgreSQL credentials.

5. Start the development server:
```bash
npm run dev
```

The server will automatically create the necessary database tables on startup.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ email: string, password: string, name: string }`
  - Returns: `{ user, access_token, refresh_token, expires_in }`

- `POST /api/auth/login` - Login user
  - Body: `{ email: string, password: string }`
  - Returns: `{ user, access_token, refresh_token, expires_in }`

- `POST /api/auth/refresh` - Refresh access token
  - Body: `{ refresh_token: string }`
  - Returns: `{ access_token, expires_in }`

- `POST /api/auth/logout` - Logout user (invalidate refresh token)
  - Body: `{ refresh_token: string }`
  - Returns: `{ message: "Logged out successfully" }`

- `GET /api/auth/me` - Get current user (requires authentication)
  - Headers: `Authorization: Bearer <access_token>`
  - Returns: `{ user }`

## Usage Examples

### Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Refresh token:
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"your-refresh-token"}'
```

### Get current user (protected route):
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer your-access-token"
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts        # Database configuration and initialization
│   ├── middleware/
│   │   └── auth.ts            # Authentication middleware
│   ├── routes/
│   │   └── auth.ts            # Authentication routes
│   ├── services/
│   │   ├── userService.ts     # User operations
│   │   └── refreshTokenService.ts  # Refresh token operations
│   ├── types/
│   │   └── auth.ts            # TypeScript types
│   ├── utils/
│   │   └── jwt.ts             # JWT token utilities
│   └── index.ts               # Main server file
└── package.json
```
