import Message from "../models/message.model.js";
import Room from '../models/room.model.js';
import { sendRoomMessageSchema, sendDirectMessageSchema } from "../validation/message.validation.js";
import log from "../utils/log.js";
import User from "../models/user.model.js";
import { createDirectMessage, createRoomMessage } from "../services/message.service.js";
export const sendRoomMessage = async (req, res) => {
    try {
        const result = sendRoomMessageSchema.safeParse(req.body);
        if (!result.success) {
            log('ERROR', 'Bad body request', result.error.issues);
            return res.status(400).json({ success: false, message: result.error.issues });
        }
        const message = await createRoomMessage({ 
            roomId: result.data.roomId,
            userId: req.user.userId,
            message: result.data.message
        })
        return res.status(201).json({ success: true, data: message });

    }
    catch(err) {
        log('ERROR', 'internal server error', { message: err.message});
        return res.status(500).json({ success: false, message: 'internal server error'})
    }
}

export const sendDirectMessage = async (req, res) => {
    try {
        const result = sendDirectMessageSchema.safeParse(req.body);
        if (!result.success) {
            log('ERROR', 'Bad body request', result.error.issues);
            return res.status(400).json({ success: false, message: result.error.issues });
        }
        const message = await createDirectMessage({
            recipientId: result.data.to,
            userId: req.user.userId,
            message: result.data.message,
        });
        return res.status(201).json({ success: true, data: message });
    }
    catch(err) {
        log('ERROR', 'internal server error', { message: err.message});
        return res.status(500).json({ success: false, message: 'internal server error'})
    }
}

export const getRoomMessages = async (req, res) => {
    try {
        log('INFO', 'Getting room messages');
        const { roomId } = req.params;
        const messages = await Message.find({ roomId: roomId });
        log('INFO', 'Successfully fetched room messages');
        return res.status(200).json({ success: true, message: 'Successfully got messages', messages});
    }
    catch(err) {
        log('ERROR', 'internal server error', { message: err.message});
        return res.status(500).json({ success: false, message: 'internal server error'})
    }
}
