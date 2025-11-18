# Testing Guide

Comprehensive testing documentation for NoteGenius.

## Table of Contents

- [Overview](#overview)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)

## Overview

NoteGenius uses a comprehensive testing strategy covering:

- **Unit Tests**: Individual functions and methods
- **Integration Tests**: API endpoints and service interactions
- **Component Tests**: React components
- **E2E Tests**: Full user flows (planned)

### Technology Stack

**Backend:**
- Jest - Testing framework
- Supertest - HTTP assertion library
- PostgreSQL - Test database

**Frontend:**
- Vitest - Testing framework (Vite-native)
- React Testing Library - Component testing
- jsdom - DOM environment

## Backend Testing

### Setup

```bash
cd backend
npm install
```

### Running Backend Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:ci

# Run specific test file
npm test -- User.test.js

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

```
backend/
├── tests/
│   ├── setup.js              # Global test configuration
│   ├── models/               # Model tests
│   │   ├── User.test.js
│   │   └── Flashcard.test.js
│   ├── services/             # Service tests
│   │   ├── authService.test.js
│   │   └── flashcardService.test.js
│   └── api/                  # API integration tests
│       ├── auth.test.js
│       └── flashcards.test.js
```

### What's Tested

#### Model Tests (`tests/models/`)

**User.test.js**
- ✅ User creation with validation
- ✅ Email uniqueness constraint
- ✅ Password hashing (bcrypt)
- ✅ Password comparison method
- ✅ Safe object serialization (no password leak)
- ✅ Default subscription tier

**Flashcard.test.js**
- ✅ Flashcard creation and validation
- ✅ SM-2 algorithm calculations
- ✅ Quality ratings (0-5)
- ✅ Ease factor adjustments
- ✅ Interval calculations
- ✅ Status progression (new → learning → reviewing → mastered)
- ✅ Due date calculations
- ✅ Relationships (User, Video)

#### Service Tests (`tests/services/`)

**authService.test.js**
- ✅ User registration
- ✅ Duplicate email handling
- ✅ Login with credentials
- ✅ JWT token generation
- ✅ Profile retrieval
- ✅ Profile updates
- ✅ Password changes
- ✅ Account deletion

**flashcardService.test.js**
- ✅ Flashcard creation (single and bulk)
- ✅ Flashcard retrieval with filters
- ✅ Due flashcard queries
- ✅ Flashcard review (SM-2)
- ✅ Statistics calculation
- ✅ Flashcard updates
- ✅ Flashcard deletion

#### API Integration Tests (`tests/api/`)

**auth.test.js**
- ✅ POST /api/v1/auth/register
- ✅ POST /api/v1/auth/login
- ✅ GET /api/v1/auth/profile
- ✅ PUT /api/v1/auth/profile
- ✅ DELETE /api/v1/auth/account
- ✅ Authentication middleware
- ✅ Error responses (400, 401, 404)

**flashcards.test.js**
- ✅ POST /api/v1/flashcards
- ✅ GET /api/v1/flashcards
- ✅ GET /api/v1/flashcards/due
- ✅ GET /api/v1/flashcards/stats
- ✅ PATCH /api/v1/flashcards/:id/review
- ✅ PUT /api/v1/flashcards/:id
- ✅ DELETE /api/v1/flashcards/:id
- ✅ Authorization checks
- ✅ Query parameter filtering

### Test Helpers

Global helpers available in all tests:

```javascript
// Create test user
const user = await global.testHelpers.createUser({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
});

// Create test course
const course = await global.testHelpers.createCourse(userId, {
  title: 'Test Course',
});

// Create test video
const video = await global.testHelpers.createVideo(courseId, {
  title: 'Test Video',
  url: 'https://youtube.com/watch?v=xxx',
});

// Generate JWT token
const token = await global.testHelpers.generateToken(user);
```

## Frontend Testing

### Setup

```bash
cd frontend
npm install
```

### Running Frontend Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
frontend/
├── src/
│   └── tests/
│       ├── setup.js               # Global test configuration
│       ├── components/            # Component tests
│       │   ├── Navbar.test.jsx
│       │   └── PrivateRoute.test.jsx
│       └── pages/                 # Page tests
│           ├── Login.test.jsx
│           └── Dashboard.test.jsx
```

### What's Tested

#### Component Tests (`src/tests/components/`)

**Navbar.test.jsx**
- ✅ Renders app name
- ✅ Shows login/register when logged out
- ✅ Shows user menu when logged in
- ✅ Shows navigation links
- ✅ Logout functionality

**PrivateRoute.test.jsx**
- ✅ Shows loading state
- ✅ Redirects when not authenticated
- ✅ Renders children when authenticated

#### Page Tests (`src/tests/pages/`)

**Login.test.jsx**
- ✅ Renders login form
- ✅ Form validation
- ✅ Login submission
- ✅ Error handling
- ✅ Loading states
- ✅ Link to registration

**Dashboard.test.jsx**
- ✅ Renders dashboard header
- ✅ Displays statistics
- ✅ Shows recent courses
- ✅ Quick action buttons
- ✅ Loading states
- ✅ Error handling

### Testing Utilities

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>{component}</BrowserRouter>
  );
};

// User interactions
const user = userEvent.setup();
await user.type(input, 'text');
await user.click(button);

// Assertions
expect(screen.getByText('Hello')).toBeInTheDocument();
expect(button).toBeDisabled();

// Async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

## Running Tests

### Backend

```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test -- User.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should create"

# Run with coverage
npm test -- --coverage

# CI mode (no watch)
npm run test:ci
```

### Frontend

```bash
cd frontend

# Run all tests
npm test

# Run specific test file
npm test Navbar.test

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Writing Tests

### Backend Test Template

```javascript
/**
 * Feature Tests
 * Description of what's being tested
 */

import { Model } from '../../src/models/index.js';

describe('Feature Name', () => {
  beforeEach(async () => {
    // Setup before each test
  });

  describe('Specific Functionality', () => {
    test('should do something', async () => {
      // Arrange
      const data = { /* test data */ };

      // Act
      const result = await someFunction(data);

      // Assert
      expect(result).toBeDefined();
      expect(result.property).toBe('expected value');
    });
  });
});
```

### Frontend Test Template

```javascript
/**
 * Component Tests
 * Description of what's being tested
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Component from '../../components/Component';

describe('Component Name', () => {
  test('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

## Test Coverage

### Current Coverage

**Backend:**
- Models: 90%+
- Services: 85%+
- Controllers: 80%+
- Overall: 85%+

**Frontend:**
- Components: 75%+
- Pages: 70%+
- Services: 80%+
- Overall: 75%+

### Coverage Goals

Maintain minimum thresholds:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### View Coverage Reports

```bash
# Backend
cd backend
npm test -- --coverage
open coverage/index.html

# Frontend
cd frontend
npm run test:coverage
open coverage/index.html
```

## Best Practices

### General

1. **Write tests first (TDD)** - Define behavior before implementation
2. **One assertion per test** - Keep tests focused and clear
3. **Use descriptive test names** - "should do X when Y"
4. **Arrange-Act-Assert** - Clear test structure
5. **Clean up after tests** - Use `beforeEach`/`afterEach`
6. **Mock external dependencies** - API calls, third-party services

### Backend

1. **Reset database** - Each test gets clean state
2. **Use test helpers** - Centralized test data creation
3. **Test edge cases** - Empty inputs, boundaries, errors
4. **Test relationships** - Verify foreign keys and joins
5. **Test security** - Authentication, authorization, validation

### Frontend

1. **Test user behavior** - Not implementation details
2. **Use semantic queries** - `getByRole`, `getByLabelText`
3. **Mock API calls** - Don't hit real endpoints
4. **Test accessibility** - Screen reader compatibility
5. **Test loading states** - Loading, error, success states

### Common Pitfalls to Avoid

❌ **Don't:**
- Test implementation details
- Write brittle tests that break on refactoring
- Skip error cases
- Forget to clean up mocks
- Test third-party libraries

✅ **Do:**
- Test user-facing behavior
- Write maintainable tests
- Test happy path AND error cases
- Reset mocks between tests
- Focus on your code

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm ci
      - run: cd backend && npm run test:ci

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd frontend && npm ci
      - run: cd frontend && npm run test:run
```

## Debugging Tests

### Backend

```bash
# Run single test in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand User.test.js

# Add debugger statement
debugger;

# Use console.log
console.log(JSON.stringify(result, null, 2));
```

### Frontend

```bash
# Open test UI
npm run test:ui

# Use screen.debug()
import { screen } from '@testing-library/react';
screen.debug(); // Prints DOM tree
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

**Last Updated:** 2025-11-18
**Maintained By:** NoteGenius Development Team
