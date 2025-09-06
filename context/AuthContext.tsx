import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getUserById } from '../backend/services';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  notificationCount: number;
  refreshCurrentUser: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for a logged-in user in localStorage on initial load
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userId = localStorage.getItem('currentUserId');
        if (userId) {
          const user = await getUserById(userId);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Failed to fetch user session:", error);
        setCurrentUser(null);
        localStorage.removeItem('currentUserId');
      } finally {
        setLoading(false);
      }
    };
    checkUserSession();
  }, []);

  // Function to manually refresh the current user's data from the backend
  const refreshCurrentUser = async () => {
    if (!currentUser) return;
    try {
      const refreshedUser = await getUserById(currentUser.id);
      setCurrentUser(refreshedUser);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  // Derive notification count from the current user's friend requests
  const notificationCount = currentUser?.friendRequestsReceived?.length ?? 0;

  const value = {
    currentUser,
    loading,
    notificationCount,
    refreshCurrentUser,
    setCurrentUser,
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