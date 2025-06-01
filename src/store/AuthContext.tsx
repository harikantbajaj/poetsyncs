// src/store/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;



// File: src/store/authStore.ts
interface User {
  id: string;
  name: string;
  email: string;
}

class AuthStore {
  private user: User | null = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  };
  private listeners: (() => void)[] = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  getUser() {
    return this.user;
  }

  login(email: string, password: string) {
    // Mock login
    this.user = {
      id: '1',
      name: 'John Doe',
      email
    };
    this.notify();
  }

  logout() {
    this.user = null;
    this.notify();
  }
}

export const authStore = new AuthStore();

export const useAuthStore = () => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      forceUpdate();
    });
    return unsubscribe;
  }, []);

  return {
    user: authStore.getUser(),
    login: authStore.login.bind(authStore),
    logout: authStore.logout.bind(authStore)
  };
};

