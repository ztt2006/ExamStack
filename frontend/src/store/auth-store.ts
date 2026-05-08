import { create } from "zustand";

import type { User } from "@/types";
import {
  clearAuthSnapshot,
  readAuthSnapshot,
  writeAuthSnapshot,
} from "@/utils/storage";

interface AuthState {
  token: string | null;
  user: User | null;
  bootstrapped: boolean;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  setBootstrapped: (bootstrapped: boolean) => void;
  logout: () => void;
}

const snapshot = readAuthSnapshot();

export const useAuthStore = create<AuthState>((set) => ({
  token: snapshot.token,
  user: snapshot.user,
  bootstrapped: false,
  setSession: (token, user) => {
    writeAuthSnapshot({ token, user });
    set({ token, user });
  },
  setUser: (user) => {
    const current = readAuthSnapshot();
    writeAuthSnapshot({ token: current.token, user });
    set({ user });
  },
  setBootstrapped: (bootstrapped) => set({ bootstrapped }),
  logout: () => {
    clearAuthSnapshot();
    set({ token: null, user: null, bootstrapped: true });
  },
}));
