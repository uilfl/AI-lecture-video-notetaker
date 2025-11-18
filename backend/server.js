import app from './src/app.js';
import dotenv from 'dotenv';
import logger from './src/utils/logger.js';
import { testConnection, syncDatabase } from './src/config/database.js';
import './src/models/index.js'; // Import models to establish relationships

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start server
 * Clean code: proper error handling and graceful shutdown
 */
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    logger.info('Database connection successful');

    // Sync database (only in development)
    if (NODE_ENV === 'development') {
      await syncDatabase({ alter: true });
      logger.info('Database synchronized');
    }

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Close database connection
          const sequelize = (await import('./src/config/database.js')).default;
          await sequelize.close();
          logger.info('Database connection closed');

          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
