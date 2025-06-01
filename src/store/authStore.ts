// File: src/store/authStore.ts (or similar path)

import { create } from 'zustand';

// Define your User interface. Make sure it has 'name' and 'email'.
export interface User {
  id: string; // Add an ID if you have one
  name: string;
  email: string;
  // Add other user properties like avatar, roles, etc.
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  // ... other auth-related states or actions
}

export const useAuthStore = create<AuthState>((set) => ({
  // --- TEMPORARY FIX: Start with a mock logged-in user for development ---
  user: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
  },
  isAuthenticated: true, // Set to true to simulate being logged in
  // --- END TEMPORARY FIX ---

  // Original or intended initial state:
  // user: null,
  // isAuthenticated: false,

  login: (userData) => set({ user: userData, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  // ... implement your actual login/logout logic here,
  // typically involving API calls and setting the user state.
}));