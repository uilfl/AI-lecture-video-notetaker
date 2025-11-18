/**
 * Dashboard Page
 * Clean code: shows courses, stats, quick actions
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/config';

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesRes, statsRes] = await Promise.all([
        api.get(API_ENDPOINTS.COURSES + '?limit=6'),
        api.get(API_ENDPOINTS.FLASHCARD_STATS + '?period=week'),
      ]);

      setCourses(coursesRes.data || []);
      setStats(statsRes.data?.stats || null);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-gray-600 mt-1">Ready to learn something new?</p>
            </div>
            <Link to="/courses/new" className="btn btn-primary">
              + New Course
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Reviews"
              value={stats.totalReviews}
              subtitle="This week"
              color="blue"
            />
            <StatCard
              title="Retention Rate"
              value={`${Math.round(stats.avgRetention * 100)}%`}
              subtitle="Correct answers"
              color="green"
            />
            <StatCard
              title="Flashcards"
              value={stats.totalCards}
              subtitle={`${stats.cardsByStatus?.mastered || 0} mastered`}
              color="purple"
            />
            <StatCard
              title="Study Streak"
              value={`${stats.streakDays} days`}
              subtitle="Keep it up!"
              color="orange"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QuickAction
            to="/review"
            title="Review Flashcards"
            description="Practice your flashcards"
            icon="🎴"
            color="primary"
          />
          <QuickAction
            to="/courses"
            title="Browse Courses"
            description="View all your courses"
            icon="📚"
            color="secondary"
          />
          <QuickAction
            to="/stats"
            title="View Progress"
            description="Check your stats"
            icon="📊"
            color="secondary"
          />
        </div>

        {/* Recent Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
            <Link to="/courses" className="text-primary-600 hover:text-primary-700 font-medium">
              View all →
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No courses yet</p>
              <Link to="/courses/new" className="btn btn-primary">
                Create Your First Course
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
  };

  return (
    <div className={`card ${colors[color]}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function QuickAction({ to, title, description, icon, color }) {
  const colorClass = color === 'primary'
    ? 'hover:border-primary-300 hover:bg-primary-50'
    : 'hover:border-gray-300 hover:bg-gray-50';

  return (
    <Link
      to={to}
      className={`card transition-all cursor-pointer ${colorClass}`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );
}

function CourseCard({ course }) {
  const progress = course.progress || 0;

  return (
    <Link to={`/courses/${course.id}`} className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
          {course.videoCount || 0} videos
        </span>
      </div>

      {course.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
