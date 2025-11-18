import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Flashcard Model
 * Stores flashcards for spaced repetition learning
 * Implements SM-2 algorithm data structure
 */
const Flashcard = sequelize.define('Flashcard', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  noteId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'notes',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Question is required',
      },
    },
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Answer is required',
      },
    },
  },
  difficulty: {
    type: DataTypes.STRING(20),
    defaultValue: 'medium',
    validate: {
      isIn: {
        args: [['easy', 'medium', 'hard']],
        msg: 'Invalid difficulty level',
      },
    },
  },
  // Spaced Repetition Algorithm fields (SM-2)
  lastReviewed: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  nextReview: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  easeFactor: {
    type: DataTypes.FLOAT,
    defaultValue: 2.5,
    comment: 'SM-2 ease factor (minimum 1.3)',
    validate: {
      min: {
        args: [1.3],
        msg: 'Ease factor must be at least 1.3',
      },
    },
  },
  intervalDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Current interval in days',
  },
  // Performance tracking
  correctCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  incorrectCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  retentionScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
    comment: 'Retention rate (0-1)',
    validate: {
      min: 0,
      max: 1,
    },
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'new',
    validate: {
      isIn: {
        args: [['new', 'learning', 'reviewing', 'mastered']],
        msg: 'Invalid status',
      },
    },
  },
}, {
  tableName: 'flashcards',
  indexes: [
    {
      fields: ['note_id'],
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['next_review'],
    },
    {
      fields: ['status'],
    },
  ],
});

/**
 * Check if flashcard is due for review
 * @returns {boolean} True if due for review
 */
Flashcard.prototype.isDue = function () {
  if (!this.nextReview) return true;
  return new Date() >= new Date(this.nextReview);
};

/**
 * Calculate next review date using SM-2 algorithm
 * @param {number} quality - Quality rating (0-5)
 * @returns {Object} Updated spaced repetition data
 */
Flashcard.prototype.calculateNextReview = function (quality) {
  let { reviewCount, easeFactor, intervalDays } = this;

  // Failed recall (quality < 3)
  if (quality < 3) {
    reviewCount = 0;
    intervalDays = 1;
  } else {
    // Successful recall
    if (reviewCount === 0) {
      intervalDays = 1;
    } else if (reviewCount === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    reviewCount += 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + intervalDays);

  return {
    reviewCount,
    easeFactor,
    intervalDays,
    nextReview,
  };
};

export default Flashcard;
