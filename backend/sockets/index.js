import socketAuth from "./auth.socket.js";


const initSockets = (io) => {
    io.use(socketAuth)
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // socket functions

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        })
    })

}

export default initSockets;