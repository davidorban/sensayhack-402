// API routes
import express from 'express';
import { ChatController } from '../controllers/chat-controller.js';

const router = express.Router();

// Chat endpoints
router.post('/chat', ChatController.processMessage);
router.post('/chat/test', ChatController.processTestMessage);

export default router;