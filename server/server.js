require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./src/services/mongodb');
const analyzeRoutes = require('./src/routes/analyze');
const entriesRoutes = require('./src/routes/entries');
const voiceRoutes = require('./src/routes/voice');
const patternsRoutes = require('./src/routes/patterns');
const spotifyRoutes = require('./src/routes/spotify');
const preferencesRoutes = require('./src/routes/preferences');
const emergencyRoutes = require('./src/routes/emergency');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Rosie is running' });
});

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/patterns', patternsRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/emergency', emergencyRoutes);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Dear Diary server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        // Start without DB in development for faster iteration
        if (process.env.NODE_ENV === 'development') {
            console.log('Starting without MongoDB — some features unavailable');
            app.listen(PORT, () => {
                console.log(`Dear Diary server running on port ${PORT} (no DB)`);
            });
        }
    }
};

startServer();
