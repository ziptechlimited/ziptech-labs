import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';

import authRoutes from './routes/authRoutes';
import cohortRoutes from './routes/cohortRoutes';
import goalRoutes from './routes/goalRoutes';
import checkInRoutes from './routes/checkInRoutes';
import supportRoutes from './routes/supportRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import meetingRoutes from './routes/meetingRoutes';
import messageRoutes from './routes/messageRoutes';
import userRoutes from './routes/userRoutes';

const app: Express = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Database Connection
mongoose.connect(config.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err: any) => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cohorts', cohortRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Ziptech Labs API Running');
});

// Start Server
app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});
