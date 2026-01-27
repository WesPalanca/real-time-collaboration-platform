import express from 'express';
const router = express.Router();
import { createRoom, getRooms } from '../controllers/room.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { addUser } from '../controllers/room.controller.js';

router.post('/', verifyToken, createRoom);
router.get('/', verifyToken, getRooms);
router.post('/:roomId/members', verifyToken, addUser);

export default router;