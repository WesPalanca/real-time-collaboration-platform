import Message from "../models/message.model.js";
import Room from "../models/room.model.js";
import AppError from "../utils/AppError.js";
import log from "../utils/log.js";

export const createRoomMessage = async ({ roomId, userId, message }) => {
    const room = await Room.findById(roomId);
    if (!room) {
        throw new AppError('Room not found', 404, 'ROOM_NOT_FOUND');
    }

    const newMessage = await Message.create({
        from: userId,
        roomId,
        message
    });
    room.lastMessage = newMessage._id;
    await room.save();
    log('INFO', 'Room message saved', { roomId, userId, messageId: newMessage._id});
    return newMessage;

}


export const createDirectMessage = async ({ recipientId, userId, message }) => {
    const recipient = await Room.findById(recipientId);
    if (!recipient) {
        throw new AppError('Recipient not found', 404, 'RECIPIENT_NOT_FOUND');
    }
    const newMessage = Message.create({
        from: userId,
        to: recipient,
        message: message
    });
    await newMessage.save();

}