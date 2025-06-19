
import { AuthTokens } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = 'http://192.168.25.101:8084';

// Generic API client with interceptors
class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  // Add auth headers to requests
  private async getHeaders(contentType = "application/json") {
    const token = await AsyncStorage.getItem("access_token");
    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": contentType,
    };
  }
  
  // Handle token refresh
  private async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const tokens: AuthTokens = await response.json();
      await AsyncStorage.setItem("access_token", tokens.access_token);
      await AsyncStorage.setItem("refresh_token", tokens.refresh_token);
      
      return tokens;
    } catch (error) {
      console.error("Error refreshing token:", error);
      // Clear tokens and force re-login
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refresh_token");
      throw error;
    }
  }
  
  // Main request method with interceptors
  async request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    contentType = "application/json"
  ): Promise<T> {
    try {
      const headers = await this.getHeaders(contentType);
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });
      
      // Handle 401 Unauthorized - try to refresh token and retry
      if (response.status === 401) {
        try {
          await this.refreshToken();
          const newHeaders = await this.getHeaders(contentType);
          
          // Retry the request with new token
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...newHeaders,
              ...options.headers,
            },
          });
          
          if (!retryResponse.ok) {
            throw new Error(`API error: ${retryResponse.status}`);
          }
          
          return await retryResponse.json();
        } catch (refreshError) {
          // If refresh fails, clear tokens and throw error
          await AsyncStorage.removeItem("access_token");
          await AsyncStorage.removeItem("refresh_token");
          throw new Error("Authentication failed. Please log in again.");
        }
      }
      
      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API error: ${response.status}`
        );
      }
      
      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }
      
      // Parse JSON response
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }
  
  // Convenience methods
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }
  
  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(
      endpoint, 
      { 
        ...options, 
        method: "POST", 
        body: data ? JSON.stringify(data) : undefined 
      }
    );
  }
  
  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(
      endpoint, 
      { 
        ...options, 
        method: "PUT", 
        body: data ? JSON.stringify(data) : undefined 
      }
    );
  }
  
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
  
  // Special method for multipart/form-data requests (file uploads)
  async postFormData<T>(endpoint: string, formData: FormData, options: RequestInit = {}): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type here, it will be set automatically with the boundary
          ...options.headers,
        },
      },
      "multipart/form-data"
    );
  }
}

// Create and export API client instance
export const api = new ApiClient(API_URL);

// Helper to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem("access_token");
  return !!token;
};

// Helper to get current user from API
export const getCurrentUser = async () => {
  try {
    return await api.get("/users/me");
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
};