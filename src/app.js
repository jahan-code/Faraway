import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';

import ApiErrorMiddleware from './middleware/ApiError.middleware.js';
import router from './router/index.js';
import cookieParser from 'cookie-parser';

const app = express();

const startServer = async () => {
    try {
        // Basic middleware
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        app.use(cookieParser());
        
        // CORS
        app.use(cors({
            origin: [
                'https://faraway-admin-panel.vercel.app',
                'http://localhost:3000',
                'https://fa-taupe.vercel.app',
                'https://faraway-admin-pannel.vercel.app',
                'https://faraway-psi.vercel.app'
            ],
            credentials: true
        }));
        
        // Static files
        app.use('/uploads', express.static(path.join(process.cwd(), 'src', 'uploads')));
        
        // Health check
        app.get('/health', (req, res) => {
            res.json({
                message: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

        // Routes
        app.use('/', router);
        app.use(ApiErrorMiddleware);
        
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
export default app;
