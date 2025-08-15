
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
        return users ? JSON.parse(users) : [];
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
    setUsers(getMockUsers());
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
    // This is a simplified version. In a real app, you'd use Firebase Admin SDK on a backend
    // to create users without logging them in. For this client-side demo, we'll just add
    // them to our mock list. We won't actually create a Firebase auth user here to avoid
    // complexity with current user state.
    const newUser = { uid: `mock-${Date.now()}`, email };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveMockUsers(updatedUsers);
    // In a real scenario, you would call a backend function:
    // await fetch('/api/create-user', { method: 'POST', body: JSON.stringify({ email, password }) });
    return Promise.resolve();
  }

  const deleteUser = async (uid: string) => {
    // Similar to createUser, this would be a backend call in a real app.
    const updatedUsers = users.filter(u => u.uid !== uid);
    setUsers(updatedUsers);
    saveMockUsers(updatedUsers);
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
