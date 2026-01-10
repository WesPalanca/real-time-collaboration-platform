import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
const socketAuth = (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) throw new Error('No token');

        const payload = jwt.verify(token, JWT_SECRET);
        socket.user = payload;
        next();

    }
    catch {
        next(new Error('Authentication Error'));
    }
}

export default socketAuth;