import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "DELETE", "PUT", "PATCH"]
    }
});

app.use(express.json());
app.use(cors());

// todo: database connection

const port = process.env.PORT || 8080
server.listen(port, () =>{
    console.log(`listening on port ${port}`)
});

