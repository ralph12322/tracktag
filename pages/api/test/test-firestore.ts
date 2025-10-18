import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/firebase/firebaseAdmin"; 

type Data = {
  success: boolean;
  data?: any;
  message?: string;
};

type UserData = {
  title: string;
  currentPrice: string;
  email: string;
  url: string;
};


export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const userData = req.body;
    const docRef = db.collection("trackedProducts").doc("testUserDoc");

    // Test Write
    await docRef.set({
      title: userData.title,
      currentPrice: userData.currentPrice,
      email: userData.email,
      url: userData.url,
      lastChecked: new Date().toISOString(),
    });

    // Test Read
    const snapshot = await docRef.get();

    res.status(200).json({ success: true, data: snapshot.data() });
    
  } catch (error: any) {
    console.error("Firestore test error:", error);
    // This logs the error, including any "5 NOT_FOUND" if it still occurs
    res.status(500).json({ success: false, message: error.message });
  }
}