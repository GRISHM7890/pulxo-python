import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { ref, onValue, set } from 'firebase/database';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (user) {
                // Fetch user profile from Realtime Database
                const profileRef = ref(db, `users/${user.uid}/profile`);
                onValue(profileRef, (snapshot) => {
                    setProfile(snapshot.val());
                    setLoading(false);
                });
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        // Safety timeout to prevent white screen if Firebase hangs
        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const updateProfile = (data) => {
        if (!user) return Promise.reject("No user logged in");
        const profileRef = ref(db, `users/${user.uid}/profile`);
        return set(profileRef, {
            ...profile,
            ...data,
            updatedAt: new Date().toISOString()
        });
    };

    const value = {
        user,
        profile,
        loading,
        signup,
        login,
        logout,
        googleSignIn,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
