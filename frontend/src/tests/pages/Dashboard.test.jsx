/**
 * Dashboard Page Tests
 * Tests for dashboard functionality
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import api from '../../services/api';

// Mock API
vi.mock('../../services/api');

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    },
  })),
}));

const mockStats = {
  courses: 5,
  videos: 12,
  notes: 45,
  flashcardsDue: 8,
};

const mockCourses = [
  {
    id: 1,
    title: 'React Basics',
    description: 'Learn React fundamentals',
    videoCount: 10,
    completedVideos: 5,
  },
  {
    id: 2,
    title: 'Advanced JavaScript',
    description: 'Master JavaScript',
    videoCount: 15,
    completedVideos: 3,
  },
];

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock API responses
    api.get.mockImplementation((url) => {
      if (url.includes('/stats')) {
        return Promise.resolve({ data: { stats: mockStats } });
      }
      if (url.includes('/courses')) {
        return Promise.resolve({ data: { courses: mockCourses } });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  test('should render dashboard header', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    });
  });

  test('should display statistics cards', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // courses
      expect(screen.getByText('12')).toBeInTheDocument(); // videos
      expect(screen.getByText('45')).toBeInTheDocument(); // notes
      expect(screen.getByText('8')).toBeInTheDocument(); // flashcards due
    });
  });

  test('should display recent courses', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
      expect(screen.getByText('Advanced JavaScript')).toBeInTheDocument();
    });
  });

  test('should show quick action buttons', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Add Course')).toBeInTheDocument();
      expect(screen.getByText('Review Flashcards')).toBeInTheDocument();
    });
  });

  test('should show loading state', () => {
    api.get.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    renderDashboard();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should handle API errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.get.mockRejectedValue(new Error('Network error'));

    renderDashboard();

    await waitFor(() => {
      // Should render without crashing
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });

  test('should display course progress bars', async () => {
    renderDashboard();

    await waitFor(() => {
      const progressBars = screen.getAllByRole('progressbar', { hidden: true });
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });
});
