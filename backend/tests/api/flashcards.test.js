/**
 * Flashcards API Integration Tests
 * Tests for flashcard endpoints
 */

import request from 'supertest';
import app from '../../src/app.js';

describe('Flashcards API', () => {
  let token, userId, courseId, videoId;

  beforeEach(async () => {
    // Register and login
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    token = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;

    // Create a course
    const courseResponse = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Course',
        description: 'Test Description',
      });

    courseId = courseResponse.body.data.course.id;

    // Create a video
    const videoResponse = await request(app)
      .post('/api/v1/videos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        courseId,
        title: 'Test Video',
        url: 'https://www.youtube.com/watch?v=test123',
      });

    videoId = videoResponse.body.data.video.id;
  });

  describe('POST /api/v1/flashcards', () => {
    test('should create a flashcard', async () => {
      const response = await request(app)
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          videoId,
          front: 'What is React?',
          back: 'A JavaScript library',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.flashcard).toBeDefined();
      expect(response.body.data.flashcard.front).toBe('What is React?');
      expect(response.body.data.flashcard.status).toBe('new');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/flashcards')
        .send({
          videoId,
          front: 'Question?',
          back: 'Answer',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          videoId,
          front: 'Question?',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/flashcards', () => {
    beforeEach(async () => {
      // Create test flashcards
      await request(app)
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          videoId,
          front: 'Question 1?',
          back: 'Answer 1',
        });

      await request(app)
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          videoId,
          front: 'Question 2?',
          back: 'Answer 2',
        });
    });

    test('should get all user flashcards', async () => {
      const response = await request(app)
        .get('/api/v1/flashcards')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.flashcards).toHaveLength(2);
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/flashcards?status=new')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.flashcards.length).toBeGreaterThan(0);
      response.body.data.flashcards.forEach(card => {
        expect(card.status).toBe('new');
      });
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/flashcards')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/flashcards/due', () => {
    beforeEach(async () => {
      // Create a flashcard
      await request(app)
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          videoId,
          front: 'Question?',
          back: 'Answer',
        });
    });

    test('should get due flashcards', async () => {
      const response = await request(app)
        .get('/api/v1/flashcards/due')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.flashcards).toBeDefined();
      expect(response.body.data.flashcards.length).toBeGreaterThan(0);
    });

    test('should respect limit parameter', async () => {
      // Create multiple flashcards
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/flashcards')
          .set('Authorization', `Bearer ${token}`)
          .send({
            videoId,
            front: `Question ${i}?`,
            back: `Answer ${i}`,
          });
      }

      const response = await request(app)
        .get('/api/v1/flashcards/due?limit=3')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.flashcards).toHaveLength(3);
    });
  });

  describe('GET /api/v1/flashcards/stats', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          videoId,
          front: 'Question?',
          back: 'Answer',
        });
    });

    test('should get flashcard statistics', async () => {
      const response = await request(app)
        .get('/api/v1/flashcards/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.total).toBe(1);
      expect(response.body.data.stats.new).toBe(1);
    });
  });

  describe('PATCH /api/v1/flashcards/:id/review', () => {
    let flashcardId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          videoId,
          front: 'Question?',
          back: 'Answer',
        });

      flashcardId = response.body.data.flashcard.id;
    });

    test('should review flashcard with quality 4 (Good)', async () => {
      const response = await request(app)
        .patch(`/api/v1/flashcards/${flashcardId}/review`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          quality: 4,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.flashcard.reviewCount).toBe(1);
      expect(response.body.data.flashcard.status).toBe('learning');
    });

    test('should review flashcard with quality 0 (Again)', async () => {
      const response = await request(app)
        .patch(`/api/v1/flashcards/${flashcardId}/review`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          quality: 0,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.flashcard.reviewCount).toBe(0);
      expect(response.body.data.flashcard.intervalDays).toBe(1);
    });

    test('should fail with invalid quality', async () => {
      const response = await request(app)
        .patch(`/api/v1/flashcards/${flashcardId}/review`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          quality: 6,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .patch(`/api/v1/flashcards/${flashcardId}/review`)
        .send({
          quality: 4,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/flashcards/:id', () => {
    let flashcardId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          videoId,
          front: 'Question?',
          back: 'Answer',
        });

      flashcardId = response.body.data.flashcard.id;
    });

    test('should update flashcard', async () => {
      const response = await request(app)
        .put(`/api/v1/flashcards/${flashcardId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          front: 'Updated Question?',
          back: 'Updated Answer',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.flashcard.front).toBe('Updated Question?');
      expect(response.body.data.flashcard.back).toBe('Updated Answer');
    });
  });

  describe('DELETE /api/v1/flashcards/:id', () => {
    let flashcardId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/flashcards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          videoId,
          front: 'Question?',
          back: 'Answer',
        });

      flashcardId = response.body.data.flashcard.id;
    });

    test('should delete flashcard', async () => {
      const response = await request(app)
        .delete(`/api/v1/flashcards/${flashcardId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify it's deleted
      const getResponse = await request(app)
        .get('/api/v1/flashcards')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getResponse.body.data.flashcards).toHaveLength(0);
    });
  });
});
