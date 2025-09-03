import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import http from 'http';
import connectDB from './config/db.js';
import express from 'express';
import path from 'path';
// Load environment variables

// Server setup
const PORT = process.env.PORT;
const server = http.createServer(app);

// Note: Static files are now served from AWS S3 instead of local storage
// The /uploads route has been removed as files are uploaded directly to S3

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Faraway is running on port ${PORT}`);
    });
});
