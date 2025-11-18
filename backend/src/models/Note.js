import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Note Model
 * Stores user notes and AI-generated notes linked to video timestamps
 * Clean separation between user-created and AI-generated content
 */
const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  videoId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'videos',
      key: 'id',
    },
    onDelete: 'CASCADE',
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Note content is required',
      },
    },
  },
  timestamp: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Video timestamp in seconds',
    validate: {
      min: {
        args: [0],
        msg: 'Timestamp must be positive',
      },
    },
  },
  aiGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  important: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  topic: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'AI-detected or user-assigned topic',
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'AI confidence score (0-1) for AI-generated notes',
    validate: {
      min: 0,
      max: 1,
    },
  },
}, {
  tableName: 'notes',
  indexes: [
    {
      fields: ['video_id'],
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['timestamp'],
    },
    {
      fields: ['important'],
      where: { important: true },
    },
    {
      fields: ['ai_generated'],
    },
  ],
});

/**
 * Format timestamp to human-readable format (HH:MM:SS)
 * @returns {string} Formatted timestamp
 */
Note.prototype.getFormattedTimestamp = function () {
  const hours = Math.floor(this.timestamp / 3600);
  const minutes = Math.floor((this.timestamp % 3600) / 60);
  const seconds = this.timestamp % 60;

  return [hours, minutes, seconds]
    .map(v => v < 10 ? '0' + v : v)
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
};

export default Note;
