import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import AppError from "../utils/AppError.js";
import log from "../utils/log.js";
import { JWT_SECRET, TOKEN_EXPIRATION } from "../config.js";
import { registerSchema, logInSchema } from "../validation/auth.validation.js";

export const register = async (req, res) => {
    try {
        const result = registerSchema.safeParse(req.body);
        if (!result.success) {
            log('ERROR', 'Bad body request', result.error.issues)
            return res.status(400).json({ success: false, message: result.error.issues });
        }
        const { username, email, password } = result.data;
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword,
        });
        await newUser.save();
        log('INFO', 'User registered succesfully');
        return res.status(201).json({success: true, message: 'User registered successfully'});


    }
    catch (err) {
        log('ERROR', 'internal server error', { message: err.message});
        return res.status(500).json({ success: false, message: 'internal server error'})
    }
}

export const logIn = async (req, res) => {
    try {
        const result = logInSchema.safeParse(req.body);
        if (!result.success) {
            log('ERROR', 'Bad body request', result.error.issues)
            return res.status(400).json({ success: false, message: result.error.issues})
        }

        const { username, email, password } = result.data;

        const user = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        })
        const correctCredentials = await bcrypt.compare(password, user.password);
        if (!correctCredentials) {
            log('ERROR', 'Incorrect credentials')
            throw new AppError("Unauthorized", 401, 'UNAUTHORIZED');
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION});
        return res.status(200).json({ success: true, message: 'User successfully logged in', token})
    }
    catch(err){
        log('ERROR', 'internal server error', { message: err.message});
        return res.status(500).json({ success: false, message: 'internal server error'})
    }
}