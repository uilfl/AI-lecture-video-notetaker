# 🎓 NoteGenius - AI-Powered Video Note-Taking Platform

> Transform how you learn from educational videos with AI-powered note-taking, automatic flashcard generation, and intelligent spaced repetition.

## 🚀 Project Vision

**NoteGenius** is a side-hustle project designed to help students and professionals learn more effectively from online courses and educational videos. The platform automatically detects key moments, generates notes, creates flashcards, and helps you retain knowledge through spaced repetition.

### 💰 Monetization Strategy

**Freemium Model:**
- **Free Tier**: 5 videos/month, basic features, YouTube only
- **Pro Tier ($9.99/mo)**: Unlimited videos, browser extension, multi-platform support
- **Premium Tier ($19.99/mo)**: Team features, API access, advanced analytics

**Target Break-even**: 10 paid users (~$100/month revenue)

## ✨ Features

### ✅ MVP Backend - COMPLETE!

**Authentication & Security**
✅ JWT authentication with refresh tokens
✅ Secure password hashing (bcrypt)
✅ Rate limiting (general + auth-specific + AI cost control)
✅ Input validation on all endpoints
✅ Comprehensive error handling with custom error classes
✅ Security headers (Helmet)
✅ CORS configuration

**Course Management**
✅ Create, read, update, delete courses
✅ Course organization by subject area
✅ Progress tracking based on watch time
✅ Course statistics (videos, notes, completion %)
✅ Archive functionality
✅ Pagination support

**Video Management**
✅ YouTube integration (automatic metadata extraction)
✅ Video transcript extraction
✅ Watch progress tracking
✅ Multi-platform ready (YouTube, Udemy, Coursera, edX, Vimeo)
✅ Thumbnail auto-generation
✅ Duration tracking

**Note-Taking System**
✅ Timestamp-linked notes
✅ Manual note creation
✅ Important notes marking
✅ Topic categorization
✅ Full-text search
✅ Filter by important/AI-generated/topic
✅ Notes grouped by topic
✅ Bulk note creation (AI-ready)

**Flashcard System**
✅ Manual flashcard creation
✅ AI-generated flashcard support
✅ SM-2 spaced repetition algorithm
✅ Due card detection and scheduling
✅ Review tracking with quality ratings (0-5)
✅ Performance metrics (retention rate, streak tracking)
✅ Status progression (new → learning → reviewing → mastered)
✅ Review statistics by time period
✅ Difficulty levels (easy, medium, hard)

**AI-Powered Features** 🤖
✅ Video transcript analysis
✅ Automatic note generation from videos
✅ AI flashcard generation from notes
✅ Topic detection
✅ Video summarization
✅ Cost-optimized prompts (GPT-3.5-turbo)
✅ Rate limiting (50 req/hour to control costs)
✅ Graceful fallback when AI disabled

**Developer Experience**
✅ Clean architecture (controllers → services → repositories)
✅ ES6 modules
✅ Comprehensive logging (Winston)
✅ API versioning
✅ Standardized responses
✅ Async error handling (no try-catch boilerplate)
✅ Environment configuration
✅ Database migrations ready

### 🚧 Coming Next

**Frontend (In Progress)**
- React 18+ with Tailwind CSS
- Video player with note-taking overlay
- Flashcard review interface
- Progress dashboard
- Mobile-responsive design

**Browser Extension (Planned)**
- Chrome/Firefox extension
- Multi-platform video capture (Udemy, Coursera, etc.)
- One-click add to NoteGenius
- Content script injection

**Advanced Features (Future)**
- Collaborative note sharing
- Export to Notion, Anki, Obsidian
- Mobile apps (iOS/Android)
- Team workspaces
- Advanced analytics
- Custom AI prompts

## 🛠️ Tech Stack

### Backend (Production-Ready)
- **Runtime**: Node.js v18+ (ES6 modules)
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **ORM**: Sequelize with relationships
- **Authentication**: JWT + bcrypt
- **AI**: OpenAI API (GPT-3.5-turbo)
- **Validation**: express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, rate limiting

### Frontend (Coming Soon)
- **Framework**: React 18+
- **Styling**: Tailwind CSS
- **State**: Context API / Zustand
- **API Client**: Axios
- **Router**: React Router v6

## 🚦 Getting Started

See [backend/README.md](./backend/README.md) for detailed setup instructions.

**Quick Start**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

## 📖 Documentation

- **[API Reference](./docs/API_REFERENCE.md)** - Complete API documentation
- **[Progress Report](./docs/PROGRESS.md)** - Detailed feature breakdown
- **[Backend README](./backend/README.md)** - Setup guide

## 📊 Development Status

**Phase 1 (Foundation)**: ✅ Complete
**Phase 2 (Core Features)**: ✅ Complete
**Phase 3 (AI Integration)**: ✅ Complete
**Phase 4 (Frontend)**: 🚧 Next Up
**Phase 5 (Browser Extension)**: ⏳ Planned

## 📜 License

MIT License

---

**Status**: 🚧 Active Development | **Version**: 0.1.0
