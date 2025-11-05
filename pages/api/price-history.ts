// API Route: /pages/api/price-history.ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { connectToDB } from "@/pages/api/start";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        await connectToDB();

        // Ensure connection is ready
        if (mongoose.connection.readyState !== 1) {
            throw new Error("MongoDB connection not ready");
        }

        const db = mongoose.connection.db;
        if (!db) throw new Error("MongoDB connection is not ready.");

        const { title, platform } = req.query;

        if (!title || typeof title !== "string") {
            return res.status(400).json({ error: "Title parameter is required" });
        }

        console.log('Searching for product:', title);

        // Case-insensitive title match with trimmed whitespace
        const trimmedTitle = title.trim();
        const product = await db
            .collection("allproducts")
            .findOne({
                title: {
                    $regex: new RegExp(`^${trimmedTitle.substring(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, "i")
                }
            });

        console.log('Product found:', product ? 'Yes' : 'No');

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Determine currency symbol
        const platformStr = typeof platform === "string" ? platform : "";
        const isLazada = platformStr.toLowerCase().includes("lazada");
        const isAmazon = platformStr.toLowerCase().includes("amazon");
        const currencySymbol = isLazada ? "₱" : isAmazon ? "$" : "";

        // Clean price values (remove ₱, $, commas, etc.)
        const cleanPrice = (value: any): number => {
            if (!value) return 0;
            return Number(String(value).replace(/[^\d.]/g, ""));
        };

        // Get price history and format it
        const priceHistory = product.priceHistory || [];

        if (priceHistory.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                currencySymbol,
                currentPrice: cleanPrice(product.currentPrice),
                originalPrice: cleanPrice(product.originalPrice)
            });
        }

        // Format price history data for the chart
        const formattedHistory = priceHistory.map((entry: any, index: number) => {
            // Handle different date formats
            let date: Date;
            if (entry.date || entry.timestamp) {
                date = new Date(entry.date || entry.timestamp);
            } else if (entry.month !== undefined && entry.day !== undefined) {
                // Use current year if no year is provided, or entry.year if available
                const year = entry.year || new Date().getFullYear();
                date = new Date(year, entry.month - 1, entry.day); // month is 0-indexed in JS Date
            } else {
                // Fallback to current date if no date info available
                date = new Date();
            }

            const monthName = date.toLocaleString('default', { month: 'short' });
            const dayNum = date.getDate();
            const label = `${monthName} ${dayNum}`;
            const price = cleanPrice(entry.price || entry.currentPrice);

            return {
                month: label,
                price,
                fullDate: date.toISOString(),
                year: date.getFullYear(),
                timestamp: date.getTime()
            };
        });

        // Sort by timestamp
        const sortedData = formattedHistory
            .sort((a: { timestamp: number; }, b: { timestamp: number; }) => a.timestamp - b.timestamp)
            .map(({ month, price }: { month: string; price: number }) => ({ month, price }));

        return res.status(200).json({
            success: true,
            data: sortedData,
            currencySymbol,
            currentPrice: cleanPrice(product.currentPrice),
            originalPrice: cleanPrice(product.originalPrice)
        });

    } catch (error: any) {
        console.error("Error fetching price history:", error);
        return res.status(500).json({ error: error.message });
    }
}