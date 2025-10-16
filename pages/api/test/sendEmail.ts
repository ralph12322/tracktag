import type { NextApiRequest, NextApiResponse } from "next";
import { sendEmail } from "@/lib/alerts/gmail"; // adjust path if needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const result = await sendEmail(to, subject, message);
    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, error: err });
  }
}
