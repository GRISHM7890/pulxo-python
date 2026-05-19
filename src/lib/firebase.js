import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAYMaUPNlXjNwZTTZx-wG6ibLLouz9oG8Y",
    authDomain: "pycompilerx.firebaseapp.com",
    databaseURL: "https://pycompilerx-default-rtdb.firebaseio.com",
    projectId: "pycompilerx",
    storageBucket: "pycompilerx.firebasestorage.app",
    messagingSenderId: "407564781368",
    appId: "1:407564781368:web:8c4550b3e3009b5a54a3cd",
    measurementId: "G-9TT95GJTBE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getDatabase(app);
const auth = getAuth(app);

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance
// Using gemini-3-flash-preview (Released Dec 2025) for absolute latest logic
const aiModel = getGenerativeModel(ai, { model: "gemini-3-flash-preview" });

export { app, analytics, db, auth, ai, aiModel };
