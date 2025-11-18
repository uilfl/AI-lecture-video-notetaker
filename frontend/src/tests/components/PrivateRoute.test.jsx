/**
 * PrivateRoute Component Tests
 * Tests for route protection
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../../components/PrivateRoute';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const TestComponent = () => <div>Protected Content</div>;

const renderWithRouter = (component, { user = null, loading = false } = {}) => {
  const { useAuth } = require('../../context/AuthContext');
  useAuth.mockReturnValue({ user, loading });

  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={component} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </BrowserRouter>
  );
};

describe('PrivateRoute', () => {
  test('should show loading state', () => {
    renderWithRouter(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      { loading: true }
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should redirect to login when not authenticated', () => {
    renderWithRouter(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      { user: null, loading: false }
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('should render children when authenticated', () => {
    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    renderWithRouter(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      { user, loading: false }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
