// API routes
import express from 'express';
import { ChatController } from '../controllers/chat-controller.js';

const router = express.Router();

// Chat endpoint
router.post('/chat', ChatController.processMessage);

export default router;