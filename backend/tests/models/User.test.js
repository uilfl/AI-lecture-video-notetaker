/**
 * User Model Tests
 * Tests for user model validations, hooks, and methods
 */

import { User } from '../../src/models/index.js';
import bcrypt from 'bcryptjs';

describe('User Model', () => {
  describe('Creation', () => {
    test('should create a user with valid data', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(user.id).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.password).not.toBe('password123'); // Should be hashed
    });

    test('should fail without required fields', async () => {
      await expect(User.create({})).rejects.toThrow();
    });

    test('should fail with invalid email', async () => {
      await expect(
        User.create({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    test('should fail with duplicate email', async () => {
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      await expect(
        User.create({
          name: 'Jane Doe',
          email: 'john@example.com',
          password: 'password456',
        })
      ).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    test('should hash password before creation', async () => {
      const plainPassword = 'password123';
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: plainPassword,
      });

      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length).toBeGreaterThan(50);
    });

    test('should hash password before update', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const oldHash = user.password;

      await user.update({ password: 'newpassword456' });

      expect(user.password).not.toBe('newpassword456');
      expect(user.password).not.toBe(oldHash);
    });

    test('should validate password with comparePassword method', async () => {
      const plainPassword = 'password123';
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: plainPassword,
      });

      const isValid = await user.comparePassword(plainPassword);
      expect(isValid).toBe(true);

      const isInvalid = await user.comparePassword('wrongpassword');
      expect(isInvalid).toBe(false);
    });
  });

  describe('Safe Object Method', () => {
    test('should return user without password', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const safeUser = user.toSafeObject();

      expect(safeUser.id).toBeDefined();
      expect(safeUser.name).toBe('John Doe');
      expect(safeUser.email).toBe('john@example.com');
      expect(safeUser.password).toBeUndefined();
    });
  });

  describe('Default Values', () => {
    test('should set default subscription tier', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(user.subscriptionTier).toBe('free');
    });

    test('should allow setting custom subscription tier', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        subscriptionTier: 'pro',
      });

      expect(user.subscriptionTier).toBe('pro');
    });
  });
});
