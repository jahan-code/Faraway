import dotenv from 'dotenv';
dotenv.config();
import path from 'path'; // add this at the top if not already

import express from 'express';
import cors from 'cors';


import ApiErrorMiddleware from './middleware/ApiError.middleware.js';
const app = express();
// Removed requestValidator import due to path-to-regexp errors
import router from './router/index.js';
import cookieParser from 'cookie-parser';
import { requestTimer } from './utils/cache.js';
// Removed all security middleware temporarily


const startServer = async () => {
    try {
        // ===== BASIC MIDDLEWARE (FIRST) =====
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        app.use(cookieParser());
        
        // ===== CORS (SECOND) =====
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
                    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
                    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
                    preflightContinue: false,
                    optionsSuccessStatus: 204
                  }
            )
        );
        
        // ===== OPTIONS REQUEST HANDLER =====
        app.options('*', (req, res) => {
            res.status(204).end();
        });
        
        // ===== STATIC FILES =====
        app.use(
            '/uploads',
            express.static(path.join(process.cwd(), 'src', 'uploads'))
        );
        
        // ===== REQUEST TIMING =====
        app.use(requestTimer);
        
        // ✅ Middleware setup complete (no security for now)

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
