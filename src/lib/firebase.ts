// IMPORTANT: You need to create a Firebase project and add your web app's
// configuration here. You can find it in the Firebase console under
// Project settings > General > Your apps > Firebase SDK snippet > Config.

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Connect to Firestore Emulator if in development
// NOTE: This must be called after getFirestore() and before any other Firestore operations.
if (process.env.NODE_ENV === 'development') {
    try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log("Firestore is connected to the emulator.");
    } catch (error) {
        // This can happen with Next.js fast refresh.
        if (error instanceof Error && error.message.includes('firestore/emulator-config-failed')) {
            // This error means the emulator is already running, which is fine.
        } else {
            console.error("Error connecting to Firestore Emulator:", error);
        }
    }
}


export { db };
