import Room from "../models/room.model.js";

const registerRoomHandlers = (io, socket) => {
    socket.on('join-room', async (roomId) => {
        const room = await Room.findById(roomId);
        if (!room) {
            return socket.emit('error', { type: 'ROOM_NOT_FOUND'});
        }

        socket.join(roomId)

    });

    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
    })

}

export default registerRoomHandlers;