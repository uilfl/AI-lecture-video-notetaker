/**
 * Navbar Component Tests
 * Tests for navigation bar component
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

// Mock AuthContext
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Helper function to render with providers
const renderWithProviders = (component, { user = null } = {}) => {
  const { useAuth } = require('../../context/AuthContext');
  useAuth.mockReturnValue({
    user,
    logout: vi.fn(),
  });

  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  test('should render app name', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('NoteGenius')).toBeInTheDocument();
  });

  test('should show login and register links when not authenticated', () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  test('should show user menu when authenticated', () => {
    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    renderWithProviders(<Navbar />, { user });

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('should show navigation links when authenticated', () => {
    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    renderWithProviders(<Navbar />, { user });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  test('should call logout when logout button is clicked', async () => {
    const { useAuth } = require('../../context/AuthContext');
    const mockLogout = vi.fn();

    useAuth.mockReturnValue({
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      },
      logout: mockLogout,
    });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    expect(mockLogout).toHaveBeenCalled();
  });
});
