import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * ReviewSession Model
 * Tracks individual flashcard review sessions for analytics
 * Clean code: focused on single responsibility (session tracking)
 */
const ReviewSession = sequelize.define('ReviewSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  flashcardId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'flashcards',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  sessionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  qualityRating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'SM-2 quality rating (0-5)',
    validate: {
      min: {
        args: [0],
        msg: 'Quality rating must be between 0 and 5',
      },
      max: {
        args: [5],
        msg: 'Quality rating must be between 0 and 5',
      },
    },
  },
  timeTaken: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time taken to review in milliseconds',
    validate: {
      min: {
        args: [0],
        msg: 'Time taken must be positive',
      },
    },
  },
  correct: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
}, {
  tableName: 'review_sessions',
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['flashcard_id'],
    },
    {
      fields: ['session_date'],
    },
  ],
});

export default ReviewSession;
