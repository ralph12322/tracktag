import type { NextApiRequest, NextApiResponse } from "next";
import { generateToken } from "@/lib/auth";
import { User } from "@/lib/models/user";
import { PendingUser } from "@/lib/models/pendingUser";
import { connectToDB } from "../start";
import { UserLog } from "@/lib/models/userLog";
import { OTP } from "@/lib/models/otp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    await connectToDB();
    const { otp, type, userId } = req.body;
    console.log(req.body)

    try {
        if (type === "signup") {
            const { email } = req.body;

            if (!otp || !type) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            // 1️⃣ Check if pending signup exists
            const pendingUser = await PendingUser.findOne({ email });
            if (!pendingUser) {
                return res.status(404).json({ error: "No pending signup found for this email" });
            }

            // 2️⃣ Validate OTP
            if (pendingUser.otp !== otp) {
                await UserLog.create({
                    email,
                    username: pendingUser.username,
                    action: "SIGNUP", // ✅ Fixed - was "SIGNUP_OTP_VERIFY"
                    status: "FAILED",
                });
                return res.status(401).json({ error: "Invalid OTP" });
            }

            if (pendingUser.expiresAt < new Date()) {
                await UserLog.create({
                    email,
                    username: pendingUser.username,
                    action: "SIGNUP", // ✅ Fixed - was "SIGNUP_OTP_EXPIRED"
                    status: "FAILED",
                });
                await PendingUser.deleteOne({ email });
                return res.status(401).json({ error: "OTP expired. Please sign up again." });
            }

            // 3️⃣ Create verified user in main User collection
            const newUser = await User.create({
                username: pendingUser.username,
                email: pendingUser.email,
                password: pendingUser.password,
                role: "User",
                isVerified: true,
                emailVerified: true,
            });

            // 4️⃣ Log success and cleanup
            await PendingUser.deleteOne({ email });
            await UserLog.create({
                email,
                username: pendingUser.username,
                action: "SIGNUP", // ✅ Fixed - was "SIGNUP_VERIFIED"
                status: "SUCCESS",
            });

            return res.status(200).json({
                success: true,
                message: "Account verified successfully! Please log in.",
            });
        }

        if (type === "login") {
            // 🔹 Login OTP verification flow
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const otpRecord = await OTP.findOne({
                email: user.email,
                type: "login",
                expiresAt: { $gt: new Date() },
            }).sort({ createdAt: -1 });

            if (!otpRecord) {
                await UserLog.create({
                    email: user.email,
                    username: user.username,
                    action: "LOGIN", // ✅ Fixed - was "LOGIN_OTP_VERIFY"
                    status: "FAILED",
                });
                return res.status(401).json({ error: "OTP expired or not found. Please request a new one." });
            }

            if (otpRecord.otp !== otp) {
                await UserLog.create({
                    email : user.email,
                    username: user.username,
                    action: "LOGIN", // ✅ Fixed - was "LOGIN_OTP_INVALID"
                    status: "FAILED",
                });
                return res.status(401).json({ error: "Invalid OTP" });
            }

            // ✅ Successful login
            await OTP.deleteOne({ _id: otpRecord._id });
            const token = generateToken(user);

            await UserLog.create({
                email : user.email,
                username: user.username,
                action: "LOGIN", // ✅ Fixed - was "LOGIN_SUCCESS"
                status: "SUCCESS",
            });

            res.setHeader(
                "Set-Cookie",
                `authToken=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`
            );

            return res.status(200).json({
                success: true,
                role: user.role,
                message: "Login successful",
            });
        }

        return res.status(400).json({ error: "Invalid verification type" });
    } catch (error) {
        console.error("❌ OTP verification error:", error);
        return res.status(500).json({ error: "Verification failed" });
    }
}