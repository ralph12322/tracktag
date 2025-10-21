import db from "./firebaseAdmin";

export type TrackedProduct = {
    user: string;
    title: string;
    currentPrice: string;
    email: string;
    isActive: Boolean;
    url: string;
    lastChecked?: string; // optional, helper can auto-set
};

const COLLECTION_NAME = "trackedProducts";

export const TrackedProducts = {
    /**
     * Add or update a tracked product for a user/document
     */
    async set(docId: string, product: TrackedProduct) {
        const docRef = db.collection(COLLECTION_NAME).doc(docId);

        const dataToSave: TrackedProduct = {
            ...product,
            lastChecked: new Date().toISOString(),
        };

        await docRef.set(dataToSave, { merge: true });
        return dataToSave;
    },

    /**
     * Get a tracked product by document ID
     */
    async get(docId: string): Promise<TrackedProduct | null> {
        const docRef = db.collection(COLLECTION_NAME).doc(docId);
        const snapshot = await docRef.get();
        if (!snapshot.exists) return null;
        return snapshot.data() as TrackedProduct;
    },

    /**
     * Delete a tracked product
     */
    async delete(docId: string) {
        const docRef = db.collection(COLLECTION_NAME).doc(docId);
        await docRef.delete();
        return true;
    },

    /**
     * List all tracked products
     */
    async list(): Promise<TrackedProduct[]> {
        const snapshot = await db
            .collection(COLLECTION_NAME)
            .where('isActive', '==', true)
            .get();
        return snapshot.docs.map(doc => doc.data() as TrackedProduct);
    },
};
