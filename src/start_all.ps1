// src/api/server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from './routes';
import { setupWebhookForExpress } from '../bot/bot'; // Import the new webhook setup function

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors({
    origin: '*', // For development simplicity
}));
app.use(express.json());

// Root endpoint for health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'MSK.Tonight API', timestamp: new Date().toISOString() });
});

// 1. Mount API routes FIRST
app.use('/api', apiRoutes);

// 2. Setup Webhook (Must happen AFTER API routes are mounted to capture the entire request lifecycle)
const startServer = async () => {
    try {
        // 1. Initialize Database
        await require('./database/db').getDB(); // Ensure DB is initialized first
        console.log("✅ Database connected and initialized.");

        // 2. Set up the webhook listener middleware on the *same* app instance
        await setupWebhookForExpress(app);

        // 3. Start Express API Listener (Listening for HTTP requests AND handling the /webhook endpoint)
        app.listen(PORT, () => {
            console.log(`\n===================================================`);
            console.log(`✅ Orchestrator Running!`);
            console.log(`✅ API Server listening on port ${PORT}`);
            console.log(`✅ Telegram Webhook registered successfully.`);
            console.log(`===================================================`);
        });

    } catch (error) {
        console.error("🚨 CRITICAL FAILURE: Failed to start API server or setup webhook.");
        console.error("Error Details:", error);
        process.exit(1);
    }
};

startServer();