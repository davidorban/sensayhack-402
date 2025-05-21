// Debug routes
import express from 'express';
import { DebugController } from '../controllers/debug-controller.js';

const router = express.Router();

// Debug message count endpoint
router.get('/message-count', DebugController.getMessageCount);

export default router;