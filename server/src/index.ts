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

app.get('/', (req: Request, res: Response) => {
    res.send('Ziptech Labs API Running');
});

// Start Server
app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});

