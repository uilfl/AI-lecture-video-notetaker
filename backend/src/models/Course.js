import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Course Model
 * Organizes videos into courses/subjects
 * Clean code: clear naming, focused responsibility
 */
const Course = sequelize.define('Course', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Course title is required',
      },
      len: {
        args: [1, 255],
        msg: 'Course title must be between 1 and 255 characters',
      },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  subjectArea: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'courses',
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['subject_area'],
    },
  ],
});

export default Course;
