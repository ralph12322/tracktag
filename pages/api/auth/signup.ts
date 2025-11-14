import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { connectToDB } from "../start";
import { PendingUser } from "@/lib/models/pendingUser";
import { User } from "@/lib/models/user";
import { generateOTP, sendOTPEmail } from "@/lib/alerts/gmail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    await connectToDB();
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email format" });

    if (password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters" });

    // Check if user or pending user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    const existingPending = await PendingUser.findOne({ email });

    if (existingUser)
      return res.status(400).json({ error: "Email or username already registered" });

    if (existingPending)
      await PendingUser.deleteOne({ email }); // clear old pending entry

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await PendingUser.create({
      username,
      email,
      password: hashedPassword,
      isVerified: true,
      otp,
      expiresAt,
    });

    const userId = await PendingUser.findOne({email})

    const emailSent = await sendOTPEmail(email, otp, "signup");

    if (!emailSent) {
      await PendingUser.deleteOne({ email });
      return res
        .status(500)
        .json({ error: "Failed to send verification email. Please try again." });
    }


    return res.status(201).json({
      success: true,
      userid: userId._id,
      email,
      message: "OTP sent to your email. Please verify to complete signup.",
      devOTP: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    return res.status(500).json({
      error: "Signup failed. Please try again.",
      details:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : "Unknown error"
          : undefined,
    });
  }
}
