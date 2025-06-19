import { AuthTokens, LoginCredentials, RegisterCredentials, User } from "@/types";
import { api } from "@/utils/api";
import { generateRandomAlias } from "@/utils/helpers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const tokens = await api.post<AuthTokens>("/auth/login", credentials);
          
          // Store tokens
          await AsyncStorage.setItem("access_token", tokens.access_token);
          await AsyncStorage.setItem("refresh_token", tokens.refresh_token);
          
          // Get user info
          await get().getCurrentUser();
          
          set({ isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Login error:", error);
          set({ 
            error: error instanceof Error ? error.message : "Login failed", 
            isLoading: false 
          });
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });
        try {
          // Generate random alias if not provided
          const finalCredentials = {
            ...credentials,
            alias: credentials.alias || generateRandomAlias(),
            userRole: "USER",
          };

          const user = await api.post("/auth/register", finalCredentials);
          
          // Auto login after registration
          await get().login({
            email: credentials.email,
            password: credentials.password,
          });
          
          set({ isLoading: false });
        } catch (error) {
          console.error("Registration error:", error);
          set({ 
            error: error instanceof Error ? error.message : "Registration failed", 
            isLoading: false 
          });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await AsyncStorage.removeItem("access_token");
          await AsyncStorage.removeItem("refresh_token");
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error("Logout error:", error);
          set({ isLoading: false });
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const token = await AsyncStorage.getItem("access_token");
          if (!token) {
            throw new Error("No token found");
          }

          const user = await api.get<User>("/users/me");
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Get user error:", error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to get user info"
          });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);