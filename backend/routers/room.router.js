import express from 'express';
const router = express.Router();
import { createRoom, getRooms } from '../controllers/room.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

router.post('/', verifyToken, createRoom);
router.get('/', verifyToken, getRooms);

export default router;