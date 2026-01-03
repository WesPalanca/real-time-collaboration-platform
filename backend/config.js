import dotenv from 'dotenv';
dotenv.config();
export const API_PREFIX = '/api/v1';
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET; 
export const TOKEN_EXPIRATION = '5hr';
export const PORT = process.env.PORT || 8080