import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.js';
import {
  createChat,
  deleteChat,
  getChatById,
  getChatMessages,
  listChats,
  sendChatMessage,
  renameChat,
} from '../controllers/chatController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', apiRateLimiter, listChats);
router.post('/', apiRateLimiter, createChat);
router.get('/:chatId', apiRateLimiter, getChatById);
router.get('/:chatId/messages', apiRateLimiter, getChatMessages);
router.post('/message', apiRateLimiter, sendChatMessage);
router.post('/:chatId/message', apiRateLimiter, sendChatMessage);
router.patch('/:chatId/rename', apiRateLimiter, renameChat);
router.delete('/:chatId', apiRateLimiter, deleteChat);

export default router;
