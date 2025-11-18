# NoteGenius Backend

Clean, scalable backend API for NoteGenius - AI-powered video note-taking application.

## Architecture

This backend follows **Clean Architecture** principles:

```
backend/
├── src/
│   ├── config/         # Configuration (database, etc.)
│   ├── models/         # Database models (Sequelize)
│   ├── repositories/   # Data access layer
│   ├── services/       # Business logic
│   ├── controllers/    # Request handlers (thin layer)
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   ├── validators/     # Input validation
│   ├── utils/          # Utility functions
│   └── app.js          # Express app setup
├── logs/               # Application logs
├── server.js           # Entry point
└── package.json
```

## Tech Stack

- **Node.js** v18+ with ES6 modules
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Winston** - Logging
- **express-validator** - Input validation
- **helmet** - Security headers
- **OpenAI API** - AI features (coming soon)

## Clean Code Principles Applied

1. **Single Responsibility** - Each file/function has one job
2. **Separation of Concerns** - Controllers → Services → Repositories
3. **DRY** - Reusable utilities and middleware
4. **Error Handling** - Centralized error handling with custom error classes
5. **Validation** - Input validation separated from business logic
6. **Security** - Rate limiting, helmet, JWT, password hashing

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

### 3. Setup Database
Make sure PostgreSQL is running, then create the database:
```bash
psql -U postgres
CREATE DATABASE notegenius;
\q
```

### 4. Run Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| PUT | `/api/v1/auth/profile` | Update profile | Yes |
| POST | `/api/v1/auth/change-password` | Change password | Yes |
| POST | `/api/v1/auth/logout` | Logout user | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## Features Implemented

✅ Clean architecture with separation of concerns
✅ JWT authentication
✅ Secure password hashing
✅ Input validation
✅ Error handling with custom error classes
✅ Rate limiting
✅ Security headers (Helmet)
✅ CORS configuration
✅ Logging (Winston)
✅ Database models with relationships
✅ Graceful shutdown

## Coming Soon

- Course management endpoints
- Video management (YouTube integration)
- Note-taking with timestamps
- AI-powered note generation (OpenAI)
- Flashcard system
- Spaced repetition algorithm
- Browser extension API support

## Database Models

- **User** - User accounts and authentication
- **Course** - Organize videos into courses
- **Video** - Video metadata and transcripts
- **Note** - User and AI-generated notes
- **Flashcard** - Spaced repetition flashcards
- **ReviewSession** - Learning analytics

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:ci
```

## Deployment

See deployment documentation for production setup with Railway/Render.

## License

MIT
