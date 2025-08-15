
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // We will create this file next

// Mock functions for user management since we don't have a backend yet
// In a real app, these would be API calls to your server/Firebase functions
type AppUser = {
    uid: string;
    email: string | null;
}

const getMockUsers = (): AppUser[] => {
    if (typeof window !== 'undefined') {
        const users = localStorage.getItem('mock-users');
        // For simplicity, we'll start with the current user if they exist
        // In a real app, you'd fetch this list from a secure backend.
        if (users) {
            try {
                const parsedUsers = JSON.parse(users);
                if (Array.isArray(parsedUsers)) {
                    return parsedUsers;
                }
            } catch (e) {
                console.error("Failed to parse users from localStorage", e);
                return [];
            }
        }
    }
    return [];
};

const saveMockUsers = (users: AppUser[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('mock-users', JSON.stringify(users));
    }
};


type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  users: AppUser[];
  createUser: (email: string, pass: string) => Promise<any>;
  deleteUser: (uid: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    // Load initial users from local storage
    setUsers(getMockUsers());
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Logic to add a newly signed-up user to our "mock" user list
      if (currentUser) {
          const userExists = getMockUsers().some(u => u.uid === currentUser.uid);
          if (!userExists) {
              const newUser = { uid: currentUser.uid, email: currentUser.email };
              const updatedUsers = [...getMockUsers(), newUser];
              saveMockUsers(updatedUsers);
              setUsers(updatedUsers);
          }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
        setError(err.message);
        throw err;
    } finally {
        setLoading(false);
    }
  }

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  }

  const createUser = async (email: string, pass: string) => {
    // This function can now be called by a logged-in user to create another user.
    // It doesn't handle the "first user" problem, but simplifies the logic greatly.
    // For this to work in a real app, you'd need secure Firebase Rules.
    try {
        // We can't *actually* create a user on behalf of someone else from the client.
        // Firebase Auth doesn't work that way for security reasons.
        // So, we'll just add them to our "mock" list. The user will need to be created
        // in the Firebase console. This function will now mainly be for display in the UI.
        console.warn("User creation from the client is mocked. Please create users in the Firebase Console.");
        
        // This is a placeholder. In a real app, you'd call a backend function.
        const newUser = { uid: `mock_${Date.now()}`, email: email };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        saveMockUsers(updatedUsers);
        
        return Promise.resolve(newUser);

    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
  }

  const deleteUser = async (uid: string) => {
    // Deleting users requires the Admin SDK and should be done from a secure backend.
    // We will only remove the user from our mock list for this demo.
    console.warn("User deletion is a mock action on the client-side.");
    if (uid.startsWith('mock_')) {
        const updatedUsers = users.filter(u => u.uid !== uid);
        setUsers(updatedUsers);
        saveMockUsers(updatedUsers);
    } else {
        // You cannot delete a real Firebase user from the client SDK.
        // We will just remove it from our list.
        const updatedUsers = users.filter(u => u.uid !== uid);
        setUsers(updatedUsers);
        saveMockUsers(updatedUsers);
        console.log(`User ${uid} removed from local list. Please delete from Firebase Console.`);
    }
    return Promise.resolve();
  }


  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, users, createUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
