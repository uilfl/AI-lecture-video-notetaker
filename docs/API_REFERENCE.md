# API Reference - NoteGenius

Complete API documentation for NoteGenius backend.

**Base URL**: `http://localhost:5000/api/v1`
**Production**: `https://your-domain.com/api/v1`

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication.

**Header Format**:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📚 Authentication Endpoints

### Register User
Create a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe"
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### Login
Authenticate and receive JWT token.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

---

## 📖 Course Endpoints

### Create Course
**Endpoint**: `POST /courses`
**Auth**: Required

**Request**:
```json
{
  "title": "Machine Learning Fundamentals",
  "description": "Introduction to ML",
  "subjectArea": "Computer Science"
}
```

### Get All Courses
**Endpoint**: `GET /courses`
**Auth**: Required

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `includeArchived` (optional): Include archived courses
- `subjectArea` (optional): Filter by subject

### Get Course Stats
**Endpoint**: `GET /courses/:id/stats`
**Auth**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "courseId": "uuid",
      "title": "ML Fundamentals",
      "totalVideos": 10,
      "totalDuration": 36000,
      "totalWatched": 18000,
      "totalNotes": 45,
      "progress": 50,
      "completedVideos": 5
    }
  }
}
```

---

## 🎥 Video Endpoints

### Add Video
**Endpoint**: `POST /videos`
**Auth**: Required

**Request**:
```json
{
  "courseId": "uuid",
  "sourceUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "Neural Networks Introduction",
  "sourceType": "youtube"
}
```

**Response**: Automatically fetches metadata and thumbnail!

### Update Watch Progress
**Endpoint**: `PATCH /videos/:id/progress`
**Auth**: Required

**Request**:
```json
{
  "watchedDuration": 1800
}
```

### Process Transcript
**Endpoint**: `POST /videos/:id/transcript`
**Auth**: Required

Manually trigger transcript extraction for a video.

---

## 📝 Note Endpoints

### Create Note
**Endpoint**: `POST /notes`
**Auth**: Required

**Request**:
```json
{
  "videoId": "uuid",
  "content": "Neural networks consist of layers of interconnected nodes",
  "timestamp": 325,
  "important": true,
  "topic": "Neural Networks"
}
```

### Get Video Notes
**Endpoint**: `GET /notes/video/:videoId`
**Auth**: Required

**Query Parameters**:
- `important`: Filter important notes
- `aiGenerated`: Filter AI-generated notes
- `topic`: Filter by topic
- `search`: Search in content

### Get Notes Grouped by Topic
**Endpoint**: `GET /notes/video/:videoId/by-topic`
**Auth**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "topics": {
      "Neural Networks": [{...}, {...}],
      "Backpropagation": [{...}],
      "Uncategorized": [{...}]
    }
  }
}
```

---

## 🎴 Flashcard Endpoints

### Create Flashcard
**Endpoint**: `POST /flashcards`
**Auth**: Required

**Request**:
```json
{
  "noteId": "uuid",
  "question": "What is backpropagation?",
  "answer": "An algorithm for training neural networks...",
  "difficulty": "medium"
}
```

### Get Due Flashcards
**Endpoint**: `GET /flashcards/due`
**Auth**: Required

Returns cards that are due for review based on SM-2 algorithm.

**Query Parameters**:
- `limit`: Max cards to return (default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "flashcards": [
      {
        "id": "uuid",
        "question": "What is a neural network?",
        "answer": "...",
        "difficulty": "easy",
        "nextReview": "2024-01-15T10:00:00Z",
        "reviewCount": 3,
        "status": "learning"
      }
    ],
    "count": 5
  }
}
```

### Review Flashcard
**Endpoint**: `POST /flashcards/:id/review`
**Auth**: Required

**Request**:
```json
{
  "quality": 4,
  "timeTaken": 5000
}
```

**Quality Scale** (SM-2 Algorithm):
- `0`: Complete blackout
- `1`: Incorrect, but familiar
- `2`: Incorrect, but almost remembered
- `3`: Correct, with difficulty
- `4`: Correct, with hesitation
- `5`: Perfect recall

**Response**:
```json
{
  "success": true,
  "data": {
    "flashcard": {...},
    "nextReview": "2024-01-20T10:00:00Z",
    "intervalDays": 5,
    "status": "reviewing"
  }
}
```

### Get Review Statistics
**Endpoint**: `GET /flashcards/stats`
**Auth**: Required

**Query Parameters**:
- `period`: Time period (`day`, `week`, `month`, `all`)

**Response**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalReviews": 150,
      "correctReviews": 123,
      "avgRetention": 0.82,
      "totalCards": 50,
      "cardsByStatus": {
        "new": 10,
        "learning": 15,
        "reviewing": 20,
        "mastered": 5
      },
      "streakDays": 12,
      "reviewsToday": 8
    }
  }
}
```

---

## 🤖 AI Endpoints

**Rate Limit**: 50 requests per hour (to control costs)

### Analyze Video Transcript
**Endpoint**: `POST /ai/analyze-video/:videoId`
**Auth**: Required
**Rate Limited**: Yes

Analyzes video transcript and generates note suggestions using AI.

**Request**:
```json
{
  "maxNotes": 10,
  "autoCreate": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Video analyzed successfully",
  "data": {
    "suggestions": [
      {
        "content": "Definition: Neural networks are computational models inspired by biological neural networks",
        "timestamp": 120,
        "topic": "Neural Networks",
        "confidence": 0.95
      }
    ],
    "created": true,
    "count": 10
  }
}
```

### Generate Flashcards from Notes
**Endpoint**: `POST /ai/generate-flashcards`
**Auth**: Required
**Rate Limited**: Yes

AI-powered flashcard generation from notes.

**Request**:
```json
{
  "noteIds": ["uuid1", "uuid2", "uuid3"],
  "cardsPerNote": 2,
  "difficulty": "mixed",
  "autoCreate": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "flashcards": [
      {
        "question": "What is the primary function of backpropagation?",
        "answer": "To calculate gradients and update weights in neural networks",
        "difficulty": "medium"
      }
    ],
    "created": true,
    "count": 6
  }
}
```

### Detect Topics
**Endpoint**: `POST /ai/detect-topics/:videoId`
**Auth**: Required
**Rate Limited**: Yes

Automatically detect main topics and subtopics from video.

**Response**:
```json
{
  "success": true,
  "data": {
    "topics": {
      "mainTopics": ["Neural Networks", "Backpropagation", "Training"],
      "subtopics": {
        "Neural Networks": ["Architecture", "Activation Functions"],
        "Backpropagation": ["Gradient Descent", "Chain Rule"]
      }
    }
  }
}
```

### Summarize Video
**Endpoint**: `POST /ai/summarize/:videoId`
**Auth**: Required
**Rate Limited**: Yes

Generate a concise summary of video content.

**Request**:
```json
{
  "maxLength": 200
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": "This lecture introduces neural networks, covering basic architecture, activation functions, and the backpropagation algorithm. Key concepts include forward pass, loss calculation, and gradient descent optimization."
  }
}
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## 🚦 Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Authentication | 5 attempts | 15 minutes |
| AI Features | 50 requests | 1 hour |

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔐 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 502 | Bad Gateway - External service error |

---

## 💡 Usage Examples

### Complete Workflow Example

```bash
# 1. Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "username": "student123",
    "password": "SecurePass123!"
  }'

# 2. Create Course
curl -X POST http://localhost:5000/api/v1/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Machine Learning Course",
    "subjectArea": "Computer Science"
  }'

# 3. Add YouTube Video
curl -X POST http://localhost:5000/api/v1/videos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE_UUID",
    "sourceUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
  }'

# 4. AI Analyze Video (generates notes automatically)
curl -X POST http://localhost:5000/api/v1/ai/analyze-video/VIDEO_UUID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maxNotes": 10,
    "autoCreate": true
  }'

# 5. Generate Flashcards from Notes
curl -X POST http://localhost:5000/api/v1/ai/generate-flashcards \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "noteIds": ["NOTE_UUID_1", "NOTE_UUID_2"],
    "cardsPerNote": 2,
    "autoCreate": true
  }'

# 6. Get Due Flashcards for Review
curl -X GET http://localhost:5000/api/v1/flashcards/due?limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 7. Review a Flashcard
curl -X POST http://localhost:5000/api/v1/flashcards/CARD_UUID/review \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quality": 4,
    "timeTaken": 5000
  }'

# 8. Get Study Statistics
curl -X GET http://localhost:5000/api/v1/flashcards/stats?period=week \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Feature Availability

| Feature | Free Tier | Pro Tier | Premium Tier |
|---------|-----------|----------|--------------|
| Videos/month | 5 | Unlimited | Unlimited |
| AI Notes | ❌ | ✅ | ✅ |
| AI Flashcards | ❌ | ✅ | ✅ |
| Manual Notes | ✅ | ✅ | ✅ |
| Manual Flashcards | ✅ | ✅ | ✅ |
| Spaced Repetition | ✅ | ✅ | ✅ |
| Progress Tracking | ✅ | ✅ | ✅ |
| Export | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ |

---

**Last Updated**: 2024-11-18
**API Version**: 1.0.0
**Backend Version**: 0.1.0
