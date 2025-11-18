import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Video Model
 * Stores video metadata and transcripts
 * Designed to support multiple platforms (YouTube, Udemy, etc.)
 */
const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Video title is required',
      },
    },
  },
  sourceUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      isUrl: {
        msg: 'Please provide a valid URL',
      },
    },
  },
  sourceType: {
    type: DataTypes.STRING(50),
    defaultValue: 'youtube',
    validate: {
      isIn: {
        args: [['youtube', 'udemy', 'coursera', 'edx', 'vimeo', 'custom']],
        msg: 'Invalid source type',
      },
    },
  },
  sourceVideoId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Platform-specific video ID (e.g., YouTube video ID)',
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in seconds',
    validate: {
      min: {
        args: [0],
        msg: 'Duration must be positive',
      },
    },
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  transcript: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  transcriptProcessed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  watchedDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total watched duration in seconds',
    validate: {
      min: {
        args: [0],
        msg: 'Watched duration must be positive',
      },
    },
  },
  lastWatched: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Platform-specific metadata',
  },
}, {
  tableName: 'videos',
  indexes: [
    {
      fields: ['course_id'],
    },
    {
      fields: ['source_video_id'],
    },
    {
      fields: ['source_type'],
    },
  ],
});

/**
 * Calculate watch progress percentage
 * @returns {number} Progress percentage (0-100)
 */
Video.prototype.getWatchProgress = function () {
  if (!this.duration || this.duration === 0) return 0;
  return Math.min(100, (this.watchedDuration / this.duration) * 100);
};

export default Video;
