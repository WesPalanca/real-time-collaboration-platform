import Room from "../models/room.model.js";
import { addUserToEntity } from "../services/user.service.js";
import log from "../utils/log.js";

const registerRoomHandlers = (io, socket) => {
    socket.on('room:join', async ({ roomId }) => {
        const room = await Room.findById(roomId).populate('members', 'username');
        if (!room) {
            return socket.emit('error', { type: 'ROOM_NOT_FOUND'});
        }

        socket.join(roomId)

    });

    socket.on('room:leave', (roomId) => {
        socket.leave(roomId);
    });

    // Real-time user addition to room
    socket.on('room:add-user', async (data) => {
        try {
            log('INFO', 'Socket: Adding user to room');
            const { roomId, recipientId } = data;
            
            const update = await addUserToEntity(Room, roomId, recipientId, 'members');
            
            const populatedRoom = await Room.findById(roomId).populate('members', 'username');
            // Broadcast to all clients in the room
            io.to(roomId).emit('room:user-added', { 
                roomId, 
                members: populatedRoom.members 
            });
            
            log('INFO', 'Socket: Successfully added user to room');
        } catch (err) {
            log('ERROR', 'Socket: Failed to add user to room', err);
            socket.emit('room:error', { message: 'Failed to add user' });
        }
    });

}

export default registerRoomHandlers;