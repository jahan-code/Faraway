import dotenv from 'dotenv';
dotenv.config();
import path from 'path'; // add this at the top if not already

import express from 'express';
import cors from 'cors';


import ApiErrorMiddleware from './middleware/ApiError.middleware.js';
const app = express();
import requestValidator from './middleware/requestValidator.middleware.js';
import router from './router/index.js';
import cookieParser from 'cookie-parser';
import { requestTimer } from './utils/cache.js';


const startServer = async () => {
    try {
        app.use(
            cors(
                {
                    origin: [
                      'https://faraway-admin-panel.vercel.app',
                      'http://localhost:3000',
                      'https://fa-taupe.vercel.app',
                      'https://faraway-admin-pannel.vercel.app',
                      'https://faraway-psi.vercel.app'
                    ],
                    credentials: true,
                  }
            )
        );
        app.use(cookieParser());
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(
            '/uploads',
            express.static(path.join(process.cwd(), 'src', 'uploads'))
        );
        // ✅ Middleware setup

        app.use(requestValidator);
        
        // Add request timing middleware
        app.use(requestTimer);

        app.get('/health', (req, res) => {
            res.json({
                message: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

        // Redis health check endpoint
        app.get('/redis-health', async (req, res) => {
            try {
                const { default: redis } = await import('./utils/cache.js');
                const start = Date.now();
                await redis.ping();
                const responseTime = Date.now() - start;
                
                res.json({
                    status: 'OK',
                    redis: 'Connected',
                    responseTime: `${responseTime}ms`,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    status: 'ERROR',
                    redis: 'Disconnected',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        app.use('/', router);
        app.use(ApiErrorMiddleware);
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
export default app;
