// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './config/database';
import { PromiseService } from './services/promiseService';
import { checkDeadlineNotifications, checkOverduePromises } from './services/notificationScheduler';
import authRoutes from './routes/auth';
import promiseRoutes from './routes/promises';
import notificationRoutes from './routes/notifications';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins in development
  credentials: true,
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Promise Tracker API', version: '1.0.0' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/promises', promiseRoutes);
app.use('/api/notifications', notificationRoutes);

// Periodic tasks

// Update overdue promises and send notifications (runs every hour)
setInterval(async () => {
  try {
    await checkOverduePromises();
  } catch (error) {
    console.error('Error checking overdue promises:', error);
  }
}, 60 * 60 * 1000); // 1 hour

// Check for deadline notifications (runs every 6 hours)
setInterval(async () => {
  try {
    await checkDeadlineNotifications();
  } catch (error) {
    console.error('Error checking deadline notifications:', error);
  }
}, 6 * 60 * 60 * 1000); // 6 hours

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API endpoint: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
