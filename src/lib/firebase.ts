import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    // Basic validation to help during local dev
    const missing = Object.entries(firebaseConfig)
      .filter(([, value]) => !value)
      .map(([key]) => key);
    if (missing.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `Missing Firebase env vars: ${missing.join(", ")}. ` +
          "Make sure NEXT_PUBLIC_FIREBASE_* secrets are set."
      );
    }
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const firebaseApp = getFirebaseApp();
export const db = getFirestore(firebaseApp);


