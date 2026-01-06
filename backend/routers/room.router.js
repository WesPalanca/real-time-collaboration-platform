import express from 'express';
const router = express.Router();
import { createRoom } from '../controllers/room.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

router.post('/', verifyToken, createRoom);

export default router;