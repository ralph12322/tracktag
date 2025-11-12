import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { connectToDB } from "@/pages/api/start";
import { TrackedProducts } from "@/lib/firebase/trackedProducts";
import { sendEmail } from "@/lib/alerts/gmail";

// Helper function to escape special regex characters
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Enhanced HTML email template matching OTP design
function createEmailHTML(
    title: string,
    oldPrice: number,
    newPrice: number,
    currencySymbol: string,
    url: string,
    platform: string
): string {
    const discountPercent = (((oldPrice - newPrice) / oldPrice) * 100).toFixed(0);
    const savings = (oldPrice - newPrice).toFixed(2);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
            border-radius: 16px;
            padding: 40px 20px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .content {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-top: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        h1 {
            color: white;
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 800;
        }
        h2 {
            color: #0f172a;
            margin: 0 0 15px 0;
            font-size: 22px;
            font-weight: 600;
        }
        .discount-badge {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            font-size: 36px;
            font-weight: bold;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .product-title {
            color: #0f172a;
            font-size: 18px;
            font-weight: 600;
            margin: 20px 0;
            line-height: 1.4;
        }
        .price-container {
            background: linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%);
            border: 2px solid #99f6e4;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        .price-row {
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin: 15px 0;
        }
        .price-block {
            flex: 1;
            text-align: center;
        }
        .price-label {
            color: #475569;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .old-price {
            color: #94a3b8;
            font-size: 24px;
            font-weight: 700;
            text-decoration: line-through;
        }
        .new-price {
            color: #0d9488;
            font-size: 32px;
            font-weight: 800;
        }
        .savings-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            text-align: left;
        }
        .savings-box p {
            margin: 0;
            color: #78350f;
            font-size: 16px;
            font-weight: 600;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
            color: white;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            margin: 25px 0;
            box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4);
        }
        .info-text {
            color: #475569;
            font-size: 15px;
            margin: 15px 0;
        }
        .footer {
            color: #e0f2fe;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        .footer p {
            margin: 5px 0;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 30px 15px;
            }
            .content {
                padding: 20px;
            }
            .discount-badge {
                font-size: 28px;
                padding: 15px;
            }
            .new-price {
                font-size: 28px;
            }
            .old-price {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <h1>TrackTag</h1>
            
            <div class="content">
                <h2>Price Drop Alert!</h2>
                
                <div class="discount-badge">
                    Save ${discountPercent}%
                </div>
                
                <div class="product-title">
                    ${title}
                </div>
                
                <div class="price-container">
                    <div class="price-row">
                        <div class="price-block">
                            <div class="price-label">Previous Price</div>
                            <div class="old-price">${currencySymbol}${oldPrice.toFixed(2)}</div>
                        </div>
                        <div class="price-block">
                            <div class="price-label">New Price</div>
                            <div class="new-price">${currencySymbol}${newPrice.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="savings-box">
                    <p>💰 You save ${currencySymbol}${savings}!</p>
                </div>
                
                <a href="${url}" class="cta-button">
                    View on ${platform} →
                </a>
                
                <p class="info-text">
                    Don't miss out on this deal! Prices may change at any time.
                </p>
            </div>
            
            <div class="footer">
                <p><strong>TrackTag Team</strong></p>
                <p>© ${new Date().getFullYear()} TrackTag. All rights reserved.</p>
                <p style="margin-top: 15px; font-size: 12px;">
                    This is an automated message, please do not reply to this email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
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
            const platform = isLazada ? "Lazada" : isAmazon ? "Amazon" : "Store";

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

                const subject = `🎉 Price Drop Alert: ${title}`;
                const htmlMessage = createEmailHTML(title, oldPrice, mongoPrice, currencySymbol, url, platform);

                try {
                    // Send alert email with HTML
                    await sendEmail(email, subject, htmlMessage);
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
            } else if (mongoPrice > oldPrice) {
                try {
                    await TrackedProducts.set(docId, {
                        ...tracked,
                        currentPrice: mongoPrice.toString(),
                    });
                    console.log(`🔄 Updated Firebase price for ${title}: ${mongoPrice}`);
                } catch (updateError) {
                    console.error(`Failed to update Firebase for ${title}:`, updateError);
                }
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