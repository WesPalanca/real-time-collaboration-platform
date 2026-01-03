

const initSockets = (io) => {
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // socket functions

        io.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        })
    })

}

export default initSockets;