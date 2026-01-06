import Message from "../models/message.model.js";
import Room from '../models/room.model.js';
import { sendRoomMessageSchema, sendDirectMessageSchema } from "../validation.js/message.validation.js";
import log from "../utils/log.js";
import User from "../models/user.model.js";

export const sendRoomMessage = async (req, res) => {
    try {
        const result = sendRoomMessageSchema.safeParse(req.body);
        if (!result.success) {
            log('ERROR', 'Bad body request', result.error.issues);
            return res.status(400).json({ success: false, message: result.error.issues });
        }
        const { roomId, message } = result.data;
        const from = req.user.userId
        const room = await Room.findById(roomId);
        if (!room){
            log('ERROR', 'Room does not exist', roomId);
            return res.status(404).json({ success: false, message: 'Room does not exist'});
        }
        const newMessage = new Message({
            from: from,
            roomId: roomId,
            message: message
        });
        await newMessage.save();
        log('INFO', 'Message sent successfully');
        return res.status(201).json({ success: true, message: 'Message sent successfully'});

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
        const { to, message } = result.data;
        const from = req.user.userId;
        
        const recipient = await User.findById(to);
        if (!recipient) {
            log('ERROR', 'Recipient not found', to);
            return res.status(404).json({ success: false, message: 'Recipient not found'});
        }
        const newMessage = new Message({
            from: from,
            to: to,
            message: message
        })
        await newMessage.save();
        log('INFO', 'Successfully send DM');
        return res.status(201).json({ success: true, message: 'Successfully send DM'});
    }
    catch(err) {
        log('ERROR', 'internal server error', { message: err.message});
        return res.status(500).json({ success: false, message: 'internal server error'})
    }
}