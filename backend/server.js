import dotenv from 'dotenv'
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import initSockets from './sockets/index.js';
import { PORT } from './config.js';
dotenv.config();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST",]
    }
});

initSockets(io);




server.listen(PORT, () =>{
    console.log(`listening on port ${PORT}`)
});

