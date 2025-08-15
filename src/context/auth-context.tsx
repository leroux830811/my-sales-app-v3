
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
            return JSON.parse(users)
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
    const initialUsers = getMockUsers();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && !initialUsers.find(u => u.uid === currentUser.uid)) {
          const newUsers = [...initialUsers, {uid: currentUser.uid, email: currentUser.email}];
          setUsers(newUsers);
          saveMockUsers(newUsers);
      } else if (!currentUser) {
          // You might want logic here to clear users if that fits your app model
      }
      setUsers(getMockUsers()); // a bit redundant, but ensures sync
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
    // This is not ideal for production as it requires elevated client-side privileges
    // or specific security rules. For this tool, it's a simplification.
    // In a real-world app, this logic should be on a secure backend.
    try {
        // Temporarily sign out the current admin user to create a new one
        const currentAuthUser = auth.currentUser;
        const adminCredentials = { email: currentAuthUser?.email, uid: currentAuthUser?.uid };

        if(currentAuthUser) await signOut(auth);

        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newUser = { uid: userCredential.user.uid, email: userCredential.user.email };
        
        // Add to our mock user list
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        saveMockUsers(updatedUsers);

        await signOut(auth); // Sign out the newly created user

        // Sign the admin back in
        // This is a big simplification. Re-authenticating would require the password, which we don't have.
        // We'll rely on the onAuthStateChanged to just show a logged-out state,
        // forcing the admin to log back in manually.
        setUser(null);

        return userCredential;
    } catch (error) {
        console.error("Error creating user:", error);
        // Attempt to log admin back in if user creation fails.
        // Again, this is a simplification.
        throw error;
    }
  }

  const deleteUser = async (uid: string) => {
    // Deleting users requires the Admin SDK and should be done from a secure backend.
    // We will only remove the user from our mock list for this demo.
    console.warn("User deletion is a mock action on the client-side.");
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
