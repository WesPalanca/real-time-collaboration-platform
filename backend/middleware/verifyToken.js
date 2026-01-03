import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import AppError from '../utils/AppError.js';
import { JWT_SECRET } from '../config.js';
dotenv.config();

export const verifyToken = (req, res, next) => {
    try {
        let token = req.header("Authorization");
        if (!JWT_SECRET) {
            throw new AppError('Misconfiguration: JWT_SECRET missing', 500, 'SERVER_ERROR');
        }
        if (!token) {
            throw new AppError('Access denied', 401, 'ACCESS_DENIED');
        }
        if (token.startsWith("Bearer ")) {
            token = token.slice(7).trim();

        }
        
        const verified = jwt.verify(token, secret);
        req.user = verified;
        next();

    }
    catch(err){
        next(err);
    }
}