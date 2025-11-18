/**
 * Course Detail Page
 * Clean code: displays course info and videos
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/config';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const [courseRes, videosRes] = await Promise.all([
        api.get(API_ENDPOINTS.COURSE(courseId)),
        api.get(API_ENDPOINTS.COURSE_VIDEOS(courseId)),
      ]);
      setCourse(courseRes.data?.course);
      setVideos(videosRes.data?.videos || []);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm('Delete this course and all its videos? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(API_ENDPOINTS.COURSE(courseId));
      navigate('/courses');
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <Link to="/courses" className="text-primary-600 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const progress = videos.length > 0
    ? Math.round((videos.filter(v => v.completed).length / videos.length) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link to="/courses" className="text-primary-600 hover:underline text-sm">
          ← Back to Courses
        </Link>
      </div>

      {/* Course Header */}
      <div className="card mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              {course.platform && (
                <span className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded">
                  {course.platform}
                </span>
              )}
            </div>
            {course.description && (
              <p className="text-gray-600 mb-4">{course.description}</p>
            )}
          </div>
          <button
            onClick={handleDeleteCourse}
            className="ml-4 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Delete Course
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard label="Videos" value={videos.length} />
          <StatCard label="Completed" value={videos.filter(v => v.completed).length} />
          <StatCard label="Notes" value={course.noteCount || 0} />
          <StatCard label="Flashcards" value={course.flashcardCount || 0} />
        </div>

        {/* Progress Bar */}
        {videos.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Course Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Videos Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Videos</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          + Add Video
        </button>
      </div>

      {/* Videos List */}
      {videos.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-bold mb-2">No videos yet</h3>
          <p className="text-gray-600 mb-6">
            Add your first video to start taking notes!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            Add Video
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              index={index}
              onUpdate={loadCourseData}
            />
          ))}
        </div>
      )}

      {/* Add Video Modal */}
      {showAddModal && (
        <AddVideoModal
          courseId={courseId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadCourseData();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-2xl font-bold text-primary-600">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function VideoCard({ video, index, onUpdate }) {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);

  const toggleCompleted = async (e) => {
    e.stopPropagation();
    setUpdating(true);

    try {
      await api.patch(API_ENDPOINTS.VIDEO(video.id), {
        completed: !video.completed,
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to update video:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={() => navigate(`/videos/${video.id}`)}
      className="card hover:shadow-lg transition-shadow cursor-pointer flex items-center gap-4"
    >
      {/* Checkbox */}
      <button
        onClick={toggleCompleted}
        disabled={updating}
        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
          video.completed
            ? 'bg-primary-600 border-primary-600'
            : 'border-gray-300 hover:border-primary-600'
        }`}
      >
        {video.completed && <span className="text-white text-sm">✓</span>}
      </button>

      {/* Thumbnail */}
      {video.thumbnailUrl && (
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-32 h-20 object-cover rounded flex-shrink-0"
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 font-medium">
                #{index + 1}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {video.title}
              </h3>
            </div>
            {video.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {video.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {video.duration && <span>⏱ {formatDuration(video.duration)}</span>}
              <span>📝 {video.noteCount || 0} notes</span>
              <span>🗂 {video.flashcardCount || 0} flashcards</span>
            </div>
          </div>
          {video.platform && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded flex-shrink-0">
              {video.platform}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function AddVideoModal({ courseId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post(API_ENDPOINTS.VIDEOS, {
        courseId: parseInt(courseId),
        ...formData,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add video');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Add Video</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="input"
              required
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Supports YouTube, Udemy, Coursera, edX, and more
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Title (optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Leave blank to auto-fetch from URL"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex-1"
            >
              {submitting ? 'Adding...' : 'Add Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
