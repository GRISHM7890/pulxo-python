import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCLMx3aJhI20p271VjrMkfHqTPxQkDD640",
    authDomain: "higgsfield-d8e10.firebaseapp.com",
    databaseURL: "https://higgsfield-d8e10-default-rtdb.firebaseio.com",
    projectId: "higgsfield-d8e10",
    storageBucket: "higgsfield-d8e10.firebasestorage.app",
    messagingSenderId: "195055501204",
    appId: "1:195055501204:web:2305fbc27b6e9910931981",
    measurementId: "G-LWWV3V40YS"
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
