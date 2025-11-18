/**
 * Video Player Page
 * Clean code: YouTube player with notes, transcript, and AI features
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/config';

export default function VideoPlayer() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [notes, setNotes] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes'); // notes, transcript, ai
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    loadVideoData();
  }, [videoId]);

  const loadVideoData = async () => {
    try {
      const [videoRes, notesRes] = await Promise.all([
        api.get(API_ENDPOINTS.VIDEO(videoId)),
        api.get(API_ENDPOINTS.VIDEO_NOTES(videoId)),
      ]);
      setVideo(videoRes.data?.video);
      setNotes(notesRes.data?.notes || []);
      setTranscript(videoRes.data?.video?.transcript || '');
    } catch (error) {
      console.error('Failed to load video:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return videoIdMatch
      ? `https://www.youtube.com/embed/${videoIdMatch[1]}?enablejsapi=1`
      : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Video not found</h2>
          <Link to="/courses" className="text-primary-600 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(video.url);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to={`/courses/${video.courseId}`}
            className="text-primary-600 hover:underline text-sm mb-2 inline-block"
          >
            ← Back to Course
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
          {video.description && (
            <p className="text-gray-600 text-sm mt-1">{video.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {embedUrl ? (
                <div className="relative pb-[56.25%]">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={embedUrl}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">Video preview not available</p>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Open in new tab →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Video Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <StatBox
                icon="📝"
                label="Notes"
                value={notes.length}
              />
              <StatBox
                icon="🗂"
                label="Flashcards"
                value={video.flashcardCount || 0}
              />
              <StatBox
                icon="⏱"
                label="Duration"
                value={video.duration ? formatDuration(video.duration) : 'N/A'}
              />
            </div>
          </div>

          {/* Right Sidebar - Notes/Transcript/AI */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-6">
              {/* Tabs */}
              <div className="border-b border-gray-200 flex">
                <TabButton
                  active={activeTab === 'notes'}
                  onClick={() => setActiveTab('notes')}
                  label="Notes"
                />
                <TabButton
                  active={activeTab === 'transcript'}
                  onClick={() => setActiveTab('transcript')}
                  label="Transcript"
                />
                <TabButton
                  active={activeTab === 'ai'}
                  onClick={() => setActiveTab('ai')}
                  label="AI"
                />
              </div>

              {/* Tab Content */}
              <div className="h-[600px] overflow-y-auto">
                {activeTab === 'notes' && (
                  <NotesPanel
                    notes={notes}
                    videoId={videoId}
                    onUpdate={loadVideoData}
                  />
                )}
                {activeTab === 'transcript' && (
                  <TranscriptPanel transcript={transcript} />
                )}
                {activeTab === 'ai' && (
                  <AIPanel videoId={videoId} onUpdate={loadVideoData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-medium transition-colors ${
        active
          ? 'text-primary-600 border-b-2 border-primary-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

function NotesPanel({ notes, videoId, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    timestamp: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post(API_ENDPOINTS.NOTES, {
        videoId: parseInt(videoId),
        content: formData.content,
        timestamp: formData.timestamp ? parseInt(formData.timestamp) : null,
      });
      setFormData({ content: '', timestamp: '' });
      setShowAddForm(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('Failed to add note. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this note?')) return;

    try {
      await api.delete(API_ENDPOINTS.NOTE(noteId));
      onUpdate();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary w-full text-sm"
        >
          + Add Note
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-gray-50 rounded-lg">
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="input text-sm mb-2"
            rows="3"
            placeholder="Write your note..."
            required
          />
          <input
            type="number"
            value={formData.timestamp}
            onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
            className="input text-sm mb-2"
            placeholder="Timestamp (seconds, optional)"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn btn-secondary text-sm flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary text-sm flex-1"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No notes yet</p>
          <p className="text-xs mt-1">Click "Add Note" to start</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, onDelete }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 group">
      <div className="flex items-start justify-between mb-2">
        {note.timestamp !== null && (
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
            {formatDuration(note.timestamp)}
          </span>
        )}
        <button
          onClick={() => onDelete(note.id)}
          className="text-gray-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Delete
        </button>
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
      {note.aiGenerated && (
        <span className="inline-block mt-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
          AI Generated
        </span>
      )}
    </div>
  );
}

function TranscriptPanel({ transcript }) {
  if (!transcript) {
    return (
      <div className="p-4 text-center py-12 text-gray-500">
        <p className="text-sm">No transcript available</p>
        <p className="text-xs mt-1">Transcript may not be available for this video</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="prose prose-sm max-w-none">
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {transcript}
        </p>
      </div>
    </div>
  );
}

function AIPanel({ videoId, onUpdate }) {
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const generateFlashcards = async () => {
    setGenerating(true);
    try {
      await api.post(API_ENDPOINTS.GENERATE_FLASHCARDS(videoId), {
        count: 5,
      });
      alert('Flashcards generated successfully!');
      onUpdate();
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
      alert(error.response?.data?.message || 'Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  const analyzeTranscript = async () => {
    setAnalyzing(true);
    try {
      const response = await api.post(API_ENDPOINTS.ANALYZE_TRANSCRIPT(videoId));
      const analysis = response.data?.analysis;

      // Create a note with the analysis
      await api.post(API_ENDPOINTS.NOTES, {
        videoId: parseInt(videoId),
        content: `AI Summary:\n\n${analysis.summary}\n\nKey Topics:\n${analysis.topics.join(', ')}`,
        aiGenerated: true,
      });

      alert('Analysis complete! Check the Notes tab.');
      onUpdate();
    } catch (error) {
      console.error('Failed to analyze:', error);
      alert(error.response?.data?.message || 'Failed to analyze transcript');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-4 space-y-3">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2">AI Features</h3>
        <p className="text-xs text-gray-600">
          Use AI to enhance your learning experience
        </p>
      </div>

      <button
        onClick={generateFlashcards}
        disabled={generating}
        className="w-full btn btn-primary text-sm flex items-center justify-center gap-2"
      >
        <span>🗂</span>
        {generating ? 'Generating...' : 'Generate Flashcards'}
      </button>

      <button
        onClick={analyzeTranscript}
        disabled={analyzing}
        className="w-full btn btn-secondary text-sm flex items-center justify-center gap-2"
      >
        <span>🤖</span>
        {analyzing ? 'Analyzing...' : 'Analyze Transcript'}
      </button>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Tips</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Generate flashcards from key concepts</li>
          <li>• Get AI-powered summaries</li>
          <li>• Identify main topics automatically</li>
        </ul>
      </div>
    </div>
  );
}

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
