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
const { globalLimiter, aiLimiter, voiceLimiter, requestTimeout } = require('./src/middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Cloud Run / reverse proxy (so rate limiter uses real client IP)
app.set('trust proxy', 1);

// Middleware
app.use(helmet());

// Support multiple frontend origins (comma-separated CLIENT_URL)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map(o => o.trim());

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting & timeout
app.use(globalLimiter);
app.use(requestTimeout(30000)); // Kill any request after 30 seconds

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Rosie is running' });
});

// Routes (AI routes get strict rate limits)
app.use('/api/analyze', aiLimiter, analyzeRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/voice', voiceLimiter, voiceRoutes);
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
