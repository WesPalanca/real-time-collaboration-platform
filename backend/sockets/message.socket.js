import { createRoomMessage } from "../services/message.service.js";
import { sendRoomMessageSchema } from "../validation/message.validation.js";

const registerMessageHandlers = (io, socket) => {
    socket.on('room:message', async (payload) => {
        try {
            const res = sendRoomMessageSchema.safeParse(payload);
            if (!res.success) {
                return socket.emit('error', { type: 'VALIDATION_ERROR', issues: res.error.issues });
            }
            const message = await createRoomMessage({ 
                roomId: res.data.roomId,
                userId: socket.user.userId,
                message: res.data.message
            });

            io.to(res.data.roomId).emit('room:message', {
                _id: message._id,
                roomId: message.roomId,
                from: message.from,
                message: message.message,
                createdAt: message.createdAt
            });
        }
        catch(err) {
            socket.emit('error', { type: err.code || 'INTERNAL_ERROR' });
        }
    })
}

export default registerMessageHandlers;