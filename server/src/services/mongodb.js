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
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(uri, {
            dbName: 'rosie',
            serverSelectionTimeoutMS: 10000, // 10s timeout instead of 30s default
        });
        console.log('Connected to MongoDB Atlas (database: rosie)');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        console.error('');
        console.error('Common fixes:');
        console.error('  1. Whitelist your IP at: https://cloud.mongodb.com -> Network Access');
        console.error('  2. Check that MONGODB_URI in .env is correct');
        console.error('  3. Check that the database user password is correct');
        console.error('');
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
