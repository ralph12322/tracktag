import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { connectToDB } from "../start";
import discountLog from "@/lib/models/discountLog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDB();

    // 🧭 Sort by latest first
    const logs = await discountLog.find().sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (error: any) {
    console.error("❌ Failed to fetch discount logs:", error);
    res.status(500).json({ error: error.message });
  }
}
