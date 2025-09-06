import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// FIX: Corrected firebase import to use compat version.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth, db } from '../firebase/config';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  notificationCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase authentication state changes
    // FIX: Use v8 `auth.onAuthStateChanged` method.
    const unsubscribeAuth = auth.onAuthStateChanged(async (user: firebase.User | null) => {
      if (user) {
        // If a user is logged in, listen for real-time updates to their Firestore document
        // FIX: Use v8 `db.collection().doc()` syntax.
        const userDocRef = db.collection('users').doc(user.uid);
        // FIX: Use v8 `.onSnapshot()` method on the document reference.
        const unsubscribeFirestore = userDocRef.onSnapshot((docSnap) => {
          // FIX: In v8, `exists` is a property, not a method.
          if (docSnap.exists) {
            // Set the current user with combined data from Auth and Firestore
            setCurrentUser({ id: docSnap.id, ...docSnap.data() } as User);
          } else {
            // This case might happen if the user document wasn't created properly on signup
            console.error("User document does not exist in Firestore.");
            setCurrentUser(null);
          }
          setLoading(false);
        });
        return () => unsubscribeFirestore(); // Cleanup Firestore listener
      } else {
        // If no user is logged in, clear the current user state
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Cleanup Auth listener
  }, []);

  // Derive notification count from the current user's friend requests
  const notificationCount = currentUser?.friendRequestsReceived?.length ?? 0;

  const value = {
    currentUser,
    loading,
    notificationCount,
  };

  // Prevent rendering children until the initial auth check is complete
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};