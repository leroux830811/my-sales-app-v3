
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase'; 

// In a real application, this user list would be fetched from a secure backend (e.g., a Firestore collection).
// For this prototype, we'll manage it in localStorage for persistence across reloads.
type AppUser = {
    uid: string;
    email: string | null;
}

const getStoredUsers = (): AppUser[] => {
    if (typeof window === 'undefined') return [];
    try {
        const users = localStorage.getItem('app-users');
        return users ? JSON.parse(users) : [];
    } catch (e) {
        console.error("Failed to parse users from localStorage", e);
        return [];
    }
};

const saveStoredUsers = (users: AppUser[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('app-users', JSON.stringify(users));
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
    // Load initial users from storage
    setUsers(getStoredUsers());
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
       // Sync user list on auth state change
       if (currentUser) {
          const storedUsers = getStoredUsers();
          const userExists = storedUsers.some(u => u.uid === currentUser.uid);
          if (!userExists) {
              const newUser = { uid: currentUser.uid, email: currentUser.email };
              const updatedUsers = [...storedUsers, newUser];
              saveStoredUsers(updatedUsers);
              setUsers(updatedUsers);
          }
      }
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

  // NOTE: In a real app, user creation/deletion should be handled by a secure backend (e.g., Firebase Functions).
  // The client should not have privileges to manage other users.
  // These functions now only manage the local list for UI purposes.
  // The actual user MUST be created in the Firebase Console.
  const createUser = async (email: string, password?: string) => {
    console.warn("This function only adds a user to the local list for UI purposes. You MUST create the user in the Firebase Authentication console.");
    const newUser = { uid: `provisional_${Date.now()}`, email: email };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
    return Promise.resolve(newUser);
  }

  const deleteUser = async (uid: string) => {
     console.warn(`This function only removes a user from the local list. You MUST delete the user from the Firebase Authentication console.`);
     const updatedUsers = users.filter(u => u.uid !== uid);
     setUsers(updatedUsers);
     saveStoredUsers(updatedUsers);
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
