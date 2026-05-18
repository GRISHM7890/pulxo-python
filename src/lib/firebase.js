import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC4XGndff_Gu_enCQ3T4jY6yqNZrgzmqE8",
    authDomain: "pulxo-python.firebaseapp.com",
    databaseURL: "https://pulxo-python-default-rtdb.firebaseio.com",
    projectId: "pulxo-python",
    storageBucket: "pulxo-python.firebasestorage.app",
    messagingSenderId: "657041715293",
    appId: "1:657041715293:web:33c283189672201c495db4",
    measurementId: "G-G9N2RKXS5W"
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
