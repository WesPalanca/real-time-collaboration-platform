import socketAuth from "./auth.socket.js";
import registerMessageHandlers from "./message.socket.js";
import registerRoomHandlers from "./room.socket.js";


const initSockets = (io) => {
    io.use(socketAuth)
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // socket functions
        registerRoomHandlers(io, socket);
        registerMessageHandlers(io, socket);

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        })
    })

}

export default initSockets;