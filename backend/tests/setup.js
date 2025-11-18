/**
 * Test Setup
 * Global test configuration and helpers
 */

import { sequelize } from '../src/models/index.js';

// Increase timeout for database operations
jest.setTimeout(10000);

// Setup before all tests
beforeAll(async () => {
  // Ensure test database connection
  try {
    await sequelize.authenticate();
    console.log('✓ Test database connected');
  } catch (error) {
    console.error('✗ Test database connection failed:', error);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  await sequelize.close();
});

// Reset database before each test
beforeEach(async () => {
  // Sync database (drops and recreates tables in test mode)
  await sequelize.sync({ force: true });
});

// Global test helpers
global.testHelpers = {
  /**
   * Create a test user
   */
  async createUser(data = {}) {
    const { User } = await import('../src/models/index.js');
    return await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      ...data,
    });
  },

  /**
   * Create a test course
   */
  async createCourse(userId, data = {}) {
    const { Course } = await import('../src/models/index.js');
    return await Course.create({
      userId,
      title: 'Test Course',
      description: 'Test course description',
      ...data,
    });
  },

  /**
   * Create a test video
   */
  async createVideo(courseId, data = {}) {
    const { Video } = await import('../src/models/index.js');
    return await Video.create({
      courseId,
      title: 'Test Video',
      url: 'https://www.youtube.com/watch?v=test123',
      platform: 'YouTube',
      ...data,
    });
  },

  /**
   * Create a test note
   */
  async createNote(videoId, userId, data = {}) {
    const { Note } = await import('../src/models/index.js');
    return await Note.create({
      videoId,
      userId,
      content: 'Test note content',
      ...data,
    });
  },

  /**
   * Create a test flashcard
   */
  async createFlashcard(videoId, userId, data = {}) {
    const { Flashcard } = await import('../src/models/index.js');
    return await Flashcard.create({
      videoId,
      userId,
      front: 'Test question?',
      back: 'Test answer',
      ...data,
    });
  },

  /**
   * Generate JWT token for testing
   */
  async generateToken(user) {
    const jwt = await import('jsonwebtoken');
    return jwt.default.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );
  },
};
