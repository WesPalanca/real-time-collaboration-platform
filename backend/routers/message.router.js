import express from 'express';
const router = express.Router();
import { sendRoomMessage, sendDirectMessage } from '../controllers/message.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

router.post('/room', verifyToken, sendRoomMessage);
router.post('/direct', verifyToken, sendDirectMessage);

export default router;