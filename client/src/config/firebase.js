// src/config/firebase.js
// Initialize Firebase with environment variables from .env
// Required .env keys:
//   VITE_FIREBASE_API_KEY
//   VITE_FIREBASE_AUTH_DOMAIN
//   VITE_FIREBASE_PROJECT_ID
//   VITE_FIREBASE_APP_ID

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Avoid re-initializing if already done (hot-reload safe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export default app;
