import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from "mongoose";

let isConnected = false;

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

// Add this handler to make it a valid API route
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDB();
  res.status(200).json({ connected: isConnected });
}

// Connection events
mongoose.connection.on('connected', () => {
    isConnected = true;
});

mongoose.connection.on('disconnected', () => {
    isConnected = false;
});

mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.error('MongoDB connection error:', err);
});