/**
 * Auth Service Tests
 * Tests for authentication business logic
 */

import * as authService from '../../src/services/authService.js';
import { User } from '../../src/models/index.js';
import { AuthenticationError, ValidationError } from '../../src/utils/errors.js';

describe('Auth Service', () => {
  describe('register', () => {
    test('should register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = await authService.register(userData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('john@example.com');
      expect(result.user.password).toBeUndefined(); // Should not include password
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    test('should fail with duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      await authService.register(userData);

      await expect(authService.register(userData)).rejects.toThrow(
        ValidationError
      );
    });

    test('should hash password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      await authService.register(userData);

      const user = await User.findOne({ where: { email: 'john@example.com' } });
      expect(user.password).not.toBe('password123');
    });

    test('should generate valid JWT token', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = await authService.register(userData);
      const jwt = await import('jsonwebtoken');

      expect(() => {
        jwt.default.verify(result.token, process.env.JWT_SECRET || 'test-secret');
      }).not.toThrow();
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
    });

    test('should login with correct credentials', async () => {
      const result = await authService.login('john@example.com', 'password123');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('john@example.com');
      expect(result.token).toBeDefined();
    });

    test('should fail with wrong password', async () => {
      await expect(
        authService.login('john@example.com', 'wrongpassword')
      ).rejects.toThrow(AuthenticationError);
    });

    test('should fail with non-existent email', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow(AuthenticationError);
    });

    test('should update last login date', async () => {
      const before = new Date();
      await authService.login('john@example.com', 'password123');

      const user = await User.findOne({ where: { email: 'john@example.com' } });
      expect(user.lastLoginAt).toBeDefined();
      expect(new Date(user.lastLoginAt).getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('getProfile', () => {
    let userId;

    beforeEach(async () => {
      const result = await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
      userId = result.user.id;
    });

    test('should get user profile', async () => {
      const profile = await authService.getProfile(userId);

      expect(profile.id).toBe(userId);
      expect(profile.email).toBe('john@example.com');
      expect(profile.password).toBeUndefined();
    });

    test('should fail with invalid user id', async () => {
      await expect(authService.getProfile(99999)).rejects.toThrow();
    });
  });

  describe('updateProfile', () => {
    let userId;

    beforeEach(async () => {
      const result = await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
      userId = result.user.id;
    });

    test('should update user name', async () => {
      const updated = await authService.updateProfile(userId, {
        name: 'Jane Doe',
      });

      expect(updated.name).toBe('Jane Doe');
      expect(updated.email).toBe('john@example.com');
    });

    test('should update user email', async () => {
      const updated = await authService.updateProfile(userId, {
        email: 'jane@example.com',
      });

      expect(updated.email).toBe('jane@example.com');
    });

    test('should update password', async () => {
      const updated = await authService.updateProfile(userId, {
        password: 'newpassword456',
      });

      // Try logging in with new password
      const result = await authService.login('john@example.com', 'newpassword456');
      expect(result.user.id).toBe(userId);
    });

    test('should fail with duplicate email', async () => {
      await authService.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      });

      await expect(
        authService.updateProfile(userId, { email: 'jane@example.com' })
      ).rejects.toThrow(ValidationError);
    });

    test('should not allow updating to empty fields', async () => {
      await expect(
        authService.updateProfile(userId, { name: '' })
      ).rejects.toThrow();
    });
  });

  describe('deleteAccount', () => {
    let userId;

    beforeEach(async () => {
      const result = await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
      userId = result.user.id;
    });

    test('should delete user account', async () => {
      await authService.deleteAccount(userId);

      const user = await User.findByPk(userId);
      expect(user).toBeNull();
    });

    test('should fail with invalid user id', async () => {
      await expect(authService.deleteAccount(99999)).rejects.toThrow();
    });
  });
});
