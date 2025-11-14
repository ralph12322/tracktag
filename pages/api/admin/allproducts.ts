import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/pages/api/start';
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).end();

    await connectToDB();

    // Ensure connection is ready
    if (mongoose.connection.readyState !== 1) {
        throw new Error("MongoDB connection not ready");
    }

    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection is not ready.");
    const count = await db
            .collection("allproducts").countDocuments();
    res.status(200).json({ count: count.toLocaleString() });

}

