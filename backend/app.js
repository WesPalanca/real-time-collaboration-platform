import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import { API_PREFIX, MONGO_URI } from './config.js';
import authRoutes from './routers/auth.router.js';


const app = express();

app.use(cors());
app.use(express.json());

// todo: database connection
mongoose.connect(MONGO_URI, {
    dbName: 'real-time-collaboration-platform'
})
.then(() => console.log('connected to mongodb'))
.catch((error) => console.error(`Error: ${error}`))
// routes
app.use(API_PREFIX, authRoutes);



app.use(errorHandler);

export default app;