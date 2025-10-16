// /lib/firebase/firebaseAdmin.ts

import * as admin from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore'; 

// --- 1. Load and Validate Environment Variables ---
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!privateKey || !clientEmail || !projectId) {
  throw new Error('FATAL: Firebase Admin config missing. Check your .env.local file.');
}

let db: Firestore;

// --- 2. Initialize App (Handles Next.js HMR/Hot Reloading) ---
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        // Replace literal '\n' characters with actual newlines
        privateKey: privateKey.replace(/\\n/g, '\n'), 
      }),
    });
    console.log("Firebase Admin App Initialized successfully.");
    
    // 3. Get the Firestore service
    db = admin.firestore();

  } catch (error: any) {
    // Log error but proceed if it's the "app already exists" error during HMR
    if (!/already exists/.test(error.message)) {
       console.error("Firebase Admin initialization error:", error.message);
    }
    db = admin.firestore(); // Get the instance even if it was a partial error
  }
} else {
  // If already initialized (common during development), just get the instance
  db = admin.firestore();
}

export default db;