import OpenAI from 'openai';
import logger from '../utils/logger.js';
import { ExternalServiceError, ValidationError } from '../utils/errors.js';

/**
 * OpenAI Service
 * Clean architecture: AI-powered features
 * Cost-optimized for side hustle monetization
 */

class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      logger.warn('OpenAI API key not configured. AI features will be disabled.');
      this.client = null;
    } else {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1500;
  }

  /**
   * Check if AI features are enabled
   */
  isEnabled() {
    return this.client !== null && process.env.ENABLE_AI_FEATURES === 'true';
  }

  /**
   * Analyze transcript and generate note suggestions
   * @param {string} transcript - Video transcript
   * @param {Object} options - Analysis options
   * @returns {Promise<Array>} Suggested notes with timestamps
   */
  async analyzeTranscript(transcript, options = {}) {
    if (!this.isEnabled()) {
      throw new ValidationError('AI features are not enabled');
    }

    if (!transcript || transcript.length < 50) {
      throw new ValidationError('Transcript is too short for analysis');
    }

    const {
      maxNotes = 10,
      includeTimestamps = true,
    } = options;

    try {
      const prompt = this._buildTranscriptAnalysisPrompt(transcript, maxNotes);

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content analyzer. Your task is to identify key concepts, definitions, and important moments from lecture transcripts.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.maxTokens,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      const notes = this._parseNoteSuggestions(response);

      logger.info(`Generated ${notes.length} note suggestions from transcript`);

      return notes;
    } catch (error) {
      logger.error('OpenAI transcript analysis failed:', error);
      throw new ExternalServiceError('OpenAI', error.message);
    }
  }

  /**
   * Generate flashcards from notes
   * @param {Array} notes - Array of note objects with content
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Generated flashcards
   */
  async generateFlashcards(notes, options = {}) {
    if (!this.isEnabled()) {
      throw new ValidationError('AI features are not enabled');
    }

    if (!notes || notes.length === 0) {
      throw new ValidationError('No notes provided for flashcard generation');
    }

    const {
      cardsPerNote = 2,
      difficulty = 'mixed',
    } = options;

    try {
      // Combine notes content
      const notesContent = notes.map((note, i) => `Note ${i + 1}: ${note.content}`).join('\n\n');

      const prompt = this._buildFlashcardGenerationPrompt(notesContent, cardsPerNote, difficulty);

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator creating effective study flashcards. Create clear, concise questions that test understanding, not just memorization.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.maxTokens,
        temperature: 0.8,
      });

      const response = completion.choices[0].message.content;
      const flashcards = this._parseFlashcards(response);

      logger.info(`Generated ${flashcards.length} flashcards from ${notes.length} notes`);

      return flashcards;
    } catch (error) {
      logger.error('OpenAI flashcard generation failed:', error);
      throw new ExternalServiceError('OpenAI', error.message);
    }
  }

  /**
   * Detect topics from transcript
   * @param {string} transcript - Video transcript
   * @returns {Promise<Array>} Detected topics
   */
  async detectTopics(transcript) {
    if (!this.isEnabled()) {
      throw new ValidationError('AI features are not enabled');
    }

    try {
      const prompt = `Analyze this lecture transcript and identify the main topics and subtopics covered. List them as a hierarchical structure.

Transcript:
${transcript.substring(0, 3000)}...

Return topics in JSON format:
{
  "mainTopics": ["Topic 1", "Topic 2"],
  "subtopics": {
    "Topic 1": ["Subtopic 1.1", "Subtopic 1.2"],
    "Topic 2": ["Subtopic 2.1"]
  }
}`;

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing educational content and identifying topics.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.5,
      });

      const response = completion.choices[0].message.content;

      // Try to parse JSON response
      try {
        const topicsData = JSON.parse(response);
        return topicsData;
      } catch (e) {
        // Fallback: extract topics from text
        return { mainTopics: [], subtopics: {} };
      }
    } catch (error) {
      logger.error('OpenAI topic detection failed:', error);
      throw new ExternalServiceError('OpenAI', error.message);
    }
  }

  /**
   * Generate summary of video content
   * @param {string} transcript - Video transcript
   * @param {number} maxLength - Max summary length in words
   * @returns {Promise<string>} Summary
   */
  async generateSummary(transcript, maxLength = 200) {
    if (!this.isEnabled()) {
      throw new ValidationError('AI features are not enabled');
    }

    try {
      const prompt = `Summarize this lecture transcript in ${maxLength} words or less. Focus on key takeaways and main concepts.

Transcript:
${transcript}`;

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating concise, informative summaries of educational content.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: Math.ceil(maxLength * 1.5),
        temperature: 0.7,
      });

      const summary = completion.choices[0].message.content;

      logger.info('Generated video summary');

      return summary;
    } catch (error) {
      logger.error('OpenAI summary generation failed:', error);
      throw new ExternalServiceError('OpenAI', error.message);
    }
  }

  /**
   * Build prompt for transcript analysis
   * @private
   */
  _buildTranscriptAnalysisPrompt(transcript, maxNotes) {
    return `Analyze this lecture transcript and identify the ${maxNotes} most important concepts, definitions, or key points. For each, provide:
- A concise note summarizing the concept
- An estimated timestamp (in seconds) where it appears
- A topic category
- An importance score (0.0-1.0)

Transcript:
${transcript.substring(0, 4000)}...

Return in JSON format:
[
  {
    "content": "Definition: Neural networks are...",
    "timestamp": 120,
    "topic": "Neural Networks",
    "confidence": 0.95
  }
]`;
  }

  /**
   * Build prompt for flashcard generation
   * @private
   */
  _buildFlashcardGenerationPrompt(notesContent, cardsPerNote, difficulty) {
    const difficultyInstruction = difficulty === 'mixed'
      ? 'Vary the difficulty level (easy, medium, hard).'
      : `Make all cards ${difficulty} difficulty.`;

    return `Create ${cardsPerNote} flashcard(s) for each of the following notes. ${difficultyInstruction}

Notes:
${notesContent}

For each flashcard, create:
- A clear, specific question
- A concise, accurate answer
- A difficulty level (easy, medium, hard)

Return in JSON format:
[
  {
    "question": "What is backpropagation?",
    "answer": "Backpropagation is an algorithm for training neural networks by calculating gradients of the loss function with respect to each weight by the chain rule.",
    "difficulty": "medium"
  }
]`;
  }

  /**
   * Parse note suggestions from AI response
   * @private
   */
  _parseNoteSuggestions(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      // Fallback: return empty array
      return [];
    } catch (error) {
      logger.error('Failed to parse note suggestions:', error);
      return [];
    }
  }

  /**
   * Parse flashcards from AI response
   * @private
   */
  _parseFlashcards(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      // Fallback: return empty array
      return [];
    } catch (error) {
      logger.error('Failed to parse flashcards:', error);
      return [];
    }
  }
}

export default new OpenAIService();
