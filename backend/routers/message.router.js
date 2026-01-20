import express from 'express';
const router = express.Router();
import { sendRoomMessage, sendDirectMessage, getRoomMessages } from '../controllers/message.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

router.post('/room', verifyToken, sendRoomMessage);
router.post('/direct', verifyToken, sendDirectMessage);
router.get('/:roomId', verifyToken, getRoomMessages);

export default router;