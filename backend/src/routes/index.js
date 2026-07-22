/**
 * @file routes/index.js
 * @description Main router file that combines all API route definitions.
 */

import express from 'express';
import authRoutes from './authRoutes.js';
import chatRoutes from './chatRoutes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);
router.use('/chat', chatRoutes);

export default router;
