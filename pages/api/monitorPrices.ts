import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { connectToDB } from "@/pages/api/start";
import { TrackedProducts } from "@/lib/firebase/trackedProducts";
import { sendEmail } from "@/lib/alerts/gmail";

// Helper function to escape special regex characters
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectToDB();

        // Ensure connection is ready
        if (mongoose.connection.readyState !== 1) {
            throw new Error("MongoDB connection not ready");
        }

        const db = mongoose.connection.db;
        if (!db) throw new Error("MongoDB connection is not ready.");

        console.log("📡 Fetching tracked products from Firebase...");
        const trackedList = await TrackedProducts.list();

        if (!trackedList.length) {
            return res.status(200).json({ message: "No tracked products found." });
        }

        const alerts: any[] = [];

        for (const tracked of trackedList) {
            const { user, title, currentPrice, email, url } = tracked;
            const docId = (tracked as any).docId ?? (tracked as any).id ?? (tracked as any)._id ?? '';
            
            console.log(`Processing tracked product - docId: ${docId}, title: ${title}`);

            // Determine currency based on platform
            const isLazada = url.includes("lazada");
            const isAmazon = url.includes("amazon");
            const currencySymbol = isLazada ? "₱" : isAmazon ? "$" : "";

            // Escape special regex characters and create case-insensitive match
            const escapedTitle = escapeRegex(title.trim());
            console.log(`Searching for product: ${title}`);

            const mongoProduct = await db
                .collection("allproducts")
                .findOne({ title: { $regex: new RegExp(`^${escapedTitle}$`, "i") } });

            if (!mongoProduct) {
                console.warn(`Product not found in MongoDB: ${title}`);
                continue;
            }

            console.log(`Product found: ${mongoProduct.title}`);

            // Clean price values (remove ₱, $, commas, etc.)
            const cleanPrice = (value: any) => {
                if (!value) return NaN;
                return Number(String(value).replace(/[^\d.]/g, ""));
            };

            const mongoPrice = cleanPrice(mongoProduct.currentPrice);
            const oldPrice = cleanPrice(currentPrice);

            if (isNaN(mongoPrice) || isNaN(oldPrice)) {
                console.warn(`Invalid price format for "${title}" (${currentPrice} → ${mongoProduct.currentPrice})`);
                continue;
            }

            // Price drop detection
            if (mongoPrice < oldPrice) {
                console.log(`✅ Price drop detected for "${title}": ${currencySymbol}${oldPrice} → ${currencySymbol}${mongoPrice}`);

                const subject = `Greetings! Price Drop Alert: ${title}`;
                const message = `
Good news! The price of "${title}" has dropped.

Old Price: ${currencySymbol}${oldPrice}
New Price: ${currencySymbol}${mongoPrice}

Check it out here: ${url}

- TrackTag Price Monitor
        `;

                try {
                    // Send alert email
                    await sendEmail(email, subject, message);
                    console.log(`📧 Email sent to ${email}`);
                } catch (emailError) {
                    console.error(`Failed to send email to ${email}:`, emailError);
                }

                // Save discount log
                const discountPercent = (((oldPrice - mongoPrice) / oldPrice) * 100).toFixed(2);
                await db.collection("discountlogs").insertOne({
                    productTitle: title,
                    platform: url.includes("lazada") ? "Lazada" : "Amazon",
                    previousPrice: oldPrice,
                    currentPrice: mongoPrice,
                    discountPercent: Number(discountPercent),
                    user: { username: user, email },
                    createdAt: new Date(),
                });

                // Update Firebase with new price
                try {
                    await TrackedProducts.set(docId, {
                        ...tracked,
                        currentPrice: mongoPrice.toString(),
                    });
                    console.log(`🔄 Updated Firebase price for ${title}: ${mongoPrice}`);
                } catch (updateError) {
                    console.error(`Failed to update Firebase for ${title}:`, updateError);
                }

                alerts.push({ title, oldPrice, newPrice: mongoPrice, email });
            } else {
                console.log(`No price drop for "${title}" (${currencySymbol}${oldPrice} → ${currencySymbol}${mongoPrice})`);
            }
        }

        if (alerts.length === 0) {
            return res.status(200).json({ message: "No price drops detected." });
        }

        console.log(`🎉 ${alerts.length} email alert(s) sent successfully.`);
        return res.status(200).json({
            message: `${alerts.length} alert(s) sent successfully.`,
            alerts,
        });
    } catch (error: any) {
        console.error("❌ Error monitoring prices:", error);
        return res.status(500).json({ error: error.message });
    }
}