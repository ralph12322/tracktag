// @/pages/api/start.ts
import mongoose from "mongoose";

let isConnected = false; // Track connection status

export async function connectToDB() {
    mongoose.set('strictQuery', true);

    if (isConnected && mongoose.connection.readyState === 1) {
        console.log('MongoDB is already connected');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI!, {
            dbName: process.env.MONGODB_DB_NAME || "your_database_name",
        });

        isConnected = true;
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        isConnected = false;
        throw error;
    }
}

// Optional: Handle connection events
mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.log('MongoDB connection disconnected');
});

mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.error('MongoDB connection error:', err);
});