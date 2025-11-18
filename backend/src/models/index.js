/**
 * Models Index
 * Establishes all model relationships
 * Clean architecture: centralized relationship management
 */

import User from './User.js';
import Course from './Course.js';
import Video from './Video.js';
import Note from './Note.js';
import Flashcard from './Flashcard.js';
import ReviewSession from './ReviewSession.js';

// User -> Courses (One-to-Many)
User.hasMany(Course, {
  foreignKey: 'userId',
  as: 'courses',
  onDelete: 'CASCADE',
});
Course.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Course -> Videos (One-to-Many)
Course.hasMany(Video, {
  foreignKey: 'courseId',
  as: 'videos',
  onDelete: 'CASCADE',
});
Video.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course',
});

// User -> Notes (One-to-Many)
User.hasMany(Note, {
  foreignKey: 'userId',
  as: 'notes',
  onDelete: 'CASCADE',
});
Note.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Video -> Notes (One-to-Many)
Video.hasMany(Note, {
  foreignKey: 'videoId',
  as: 'notes',
  onDelete: 'CASCADE',
});
Note.belongsTo(Video, {
  foreignKey: 'videoId',
  as: 'video',
});

// User -> Flashcards (One-to-Many)
User.hasMany(Flashcard, {
  foreignKey: 'userId',
  as: 'flashcards',
  onDelete: 'CASCADE',
});
Flashcard.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Note -> Flashcards (One-to-Many, optional)
Note.hasMany(Flashcard, {
  foreignKey: 'noteId',
  as: 'flashcards',
  onDelete: 'SET NULL',
});
Flashcard.belongsTo(Note, {
  foreignKey: 'noteId',
  as: 'note',
});

// User -> ReviewSessions (One-to-Many)
User.hasMany(ReviewSession, {
  foreignKey: 'userId',
  as: 'reviewSessions',
  onDelete: 'CASCADE',
});
ReviewSession.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Flashcard -> ReviewSessions (One-to-Many)
Flashcard.hasMany(ReviewSession, {
  foreignKey: 'flashcardId',
  as: 'reviewSessions',
  onDelete: 'CASCADE',
});
ReviewSession.belongsTo(Flashcard, {
  foreignKey: 'flashcardId',
  as: 'flashcard',
});

export {
  User,
  Course,
  Video,
  Note,
  Flashcard,
  ReviewSession,
};
