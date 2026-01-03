import express from 'express';
import { register, logIn } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
const router = express.Router();

router.post('/auth/register', register);
router.get('/auth/logIn', logIn, verifyToken);

export default router;
