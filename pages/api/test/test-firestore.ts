// /pages/api/test/test-firestore.ts

import type { NextApiRequest, NextApiResponse } from "next";
// Adjust relative path if necessary
import db from "../../../lib/firebase/firebaseAdmin"; 

type Data = {
  success: boolean;
  data?: any;
  message?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const docRef = db.collection("trackedProducts").doc("testUserDoc");

    // Test Write
    await docRef.set({
      title: "Test Product V2",
      currentPrice: "1234", 
      url: "https://example.com/product",
      imageUrl: "https://example.com/image.jpg",
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