import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDB } from "@/pages/api/start";
import { Product } from "@/lib/models/product";
import { parseUserFromReq } from "@/lib/utils/auth";
import { TrackedProducts } from "@/lib/firebase/trackedProducts";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectToDB();

    const user = await parseUserFromReq(req);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.query;
    const { isActive } = req.body;

    // Update MongoDB
    const product = await Product.findOneAndUpdate(
      { _id: id, user: user._id },
      { isActive },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update Firestore
    try {
      const firestoreDoc = await TrackedProducts.get(id as string);
      
      if (firestoreDoc) {
        await TrackedProducts.set(id as string, {
          ...firestoreDoc,
          isActive: isActive,
        });
      }
    } catch (firestoreError) {
      console.error("Error updating Firestore:", firestoreError);
      // You can decide whether to fail the whole request or just log the error
      // For now, we'll log but continue since MongoDB was updated successfully
    }

    return res.status(200).json({ success: true, product });

  } catch (error: any) {
    console.error("Error toggling product status:", error);
    return res.status(500).json({ error: error.message });
  }
}