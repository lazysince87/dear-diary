const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 */
async function connectDB() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('MONGODB_URI not set in environment variables');
    }

    try {
        await mongoose.connect(uri, {
            dbName: 'rosie',
        });
        console.log('🗄️  Connected to MongoDB Atlas');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
}

module.exports = { connectDB, disconnectDB };
