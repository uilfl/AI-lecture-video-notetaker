/**
 * Flashcard Review Page
 * Clean code: implements SM-2 spaced repetition review
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { API_ENDPOINTS } from '../constants/config';

export default function FlashcardReview() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    reviewed: 0,
    correct: 0,
  });

  useEffect(() => {
    loadDueCards();
  }, []);

  const loadDueCards = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.DUE_FLASHCARDS + '?limit=20');
      setCards(response.data?.flashcards || []);
      setSessionStats({
        total: response.data?.flashcards?.length || 0,
        reviewed: 0,
        correct: 0,
      });
    } catch (error) {
      console.error('Failed to load flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (quality) => {
    if (reviewing) return;

    const currentCard = cards[currentIndex];
    setReviewing(true);

    try {
      await api.post(API_ENDPOINTS.REVIEW_FLASHCARD(currentCard.id), {
        quality,
        timeTaken: null,
      });

      // Update stats
      setSessionStats(prev => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        correct: quality >= 3 ? prev.correct + 1 : prev.correct,
      }));

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // Session complete
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to review flashcard:', error);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">All caught up!</h2>
          <p className="text-gray-600 mb-6">
            No flashcards are due for review right now.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">Review Session</h1>
            <div className="text-sm text-gray-600">
              {currentIndex + 1} / {cards.length}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div
          className="card min-h-[300px] flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => !showAnswer && setShowAnswer(true)}
        >
          {!showAnswer ? (
            <>
              <p className="text-sm text-gray-500 mb-4">Question</p>
              <h2 className="text-2xl font-semibold mb-6">
                {currentCard.question}
              </h2>
              <p className="text-sm text-primary-600">Tap to reveal answer</p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-2">Question</p>
              <p className="text-lg mb-6">{currentCard.question}</p>
              <div className="w-full h-px bg-gray-200 my-4" />
              <p className="text-sm text-gray-500 mb-2">Answer</p>
              <p className="text-xl font-semibold text-primary-700">
                {currentCard.answer}
              </p>
            </>
          )}
        </div>

        {/* Rating Buttons */}
        {showAnswer && (
          <div className="mt-8">
            <p className="text-center text-sm text-gray-600 mb-4">
              How well did you know this?
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <RatingButton
                label="Again"
                subtitle="Didn't know"
                quality={0}
                color="red"
                onClick={handleRate}
                disabled={reviewing}
              />
              <RatingButton
                label="Hard"
                subtitle="Struggled"
                quality={2}
                color="orange"
                onClick={handleRate}
                disabled={reviewing}
              />
              <RatingButton
                label="Good"
                subtitle="Knew it"
                quality={4}
                color="blue"
                onClick={handleRate}
                disabled={reviewing}
              />
              <RatingButton
                label="Easy"
                subtitle="Perfect!"
                quality={5}
                color="green"
                onClick={handleRate}
                disabled={reviewing}
              />
            </div>
          </div>
        )}

        {/* Session Stats */}
        <div className="mt-8 text-center">
          <div className="inline-flex space-x-6 text-sm text-gray-600">
            <div>
              Reviewed: <span className="font-semibold">{sessionStats.reviewed}</span>
            </div>
            <div>
              Correct: <span className="font-semibold text-green-600">
                {sessionStats.correct}
              </span>
            </div>
            <div>
              Remaining: <span className="font-semibold">
                {cards.length - currentIndex - 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RatingButton({ label, subtitle, quality, color, onClick, disabled }) {
  const colors = {
    red: 'bg-red-100 hover:bg-red-200 text-red-700 border-red-300',
    orange: 'bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-300',
    blue: 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300',
    green: 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300',
  };

  return (
    <button
      onClick={() => onClick(quality)}
      disabled={disabled}
      className={`p-4 rounded-lg border-2 transition-all ${colors[color]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="font-semibold">{label}</div>
      <div className="text-xs mt-1">{subtitle}</div>
    </button>
  );
}
