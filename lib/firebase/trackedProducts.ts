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

export type TrackedProductWithId = TrackedProduct & {
    docId: string; // Add document ID to the type
};

const COLLECTION_NAME = "trackedProducts";

export const TrackedProducts = {
    /**
     * Add or update a tracked product for a user/document
     */
    async set(docId: string, product: TrackedProduct) {
        try {
            const docRef = db.collection(COLLECTION_NAME).doc(docId);

            const dataToSave: TrackedProduct = {
                ...product,
                lastChecked: new Date().toISOString(),
            };

            console.log(`Updating Firestore doc ${docId} with price:`, dataToSave.currentPrice);
            await docRef.set(dataToSave, { merge: true });
            console.log(`✅ Firestore doc ${docId} updated successfully`);
            return dataToSave;
        } catch (error) {
            console.error(`❌ Failed to update Firestore doc ${docId}:`, error);
            throw error;
        }
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
     * List all tracked products (with document IDs)
     */
    async list(): Promise<TrackedProductWithId[]> {
        try {
            const snapshot = await db
                .collection(COLLECTION_NAME)
                .where('isActive', '==', true)
                .get();
            
            console.log(`Found ${snapshot.docs.length} tracked products`);
            
            const results = snapshot.docs.map(doc => {
                const data = doc.data() as TrackedProduct;
                console.log(`Document ID: "${doc.id}", Title: "${data.title}"`);
                return {
                    ...data,
                    docId: doc.id
                };
            });
            
            return results;
        } catch (error) {
            console.error('Error listing tracked products:', error);
            throw error;
        }
    },
};