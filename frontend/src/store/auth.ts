import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "customer" | "owner" | "admin";
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "sm-auth" }
  )
);
