import { AuthTokens } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const API_URL = "http://192.168.25.101:8084/api/v1";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(contentType = "application/json") {
    const token = await AsyncStorage.getItem("access_token");
    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": contentType,
    };
  }

  private async removeTokensAndRedirectToLogin() {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    router.replace("/login");
  }

  private async refreshToken() {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error("Failed to refresh token");

    const tokens: AuthTokens = await response.json();
    await AsyncStorage.setItem("access_token", tokens.access_token);
    await AsyncStorage.setItem("refresh_token", tokens.refresh_token);
    return tokens;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    contentType = "application/json"
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const makeFetch = async () =>
      await fetch(url, {
        ...options,
        headers: {
          ...(await this.getHeaders(contentType)),
          ...options.headers,
        },
      });

    try {
      let response = await makeFetch();

      if (response.status === 401) {
        try {
          await this.refreshToken();
          response = await makeFetch(); // Retry with new token
        } catch (refreshError) {
          await this.removeTokensAndRedirectToLogin();
          throw new Error("Autentificare eșuată. Reautentifică-te.");
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Eroare API: ${response.status}`);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  async postFormData<T>(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
  ): Promise<T> {
  const url = `${this.baseUrl}${endpoint}`;

  console.log("POST FormData URL:", url);
  console.log("POST FormData Headers:", options.headers);
  console.log("POST FormData Body:", formData);

  const makeFetch = async () => {
    const token = await AsyncStorage.getItem("access_token");
    console.log("POST FormData Token:", token);

    const headers = {
        Authorization: token ? `Bearer ${token}` : "",
        'Content-Type': 'multipart/form-data',
        ...options.headers, // FĂRĂ Content-Type!!!
      };

      console.log("POST FormData Final Headers:", headers);

    return await fetch(url, {
      method: "POST",
      body: formData,
      headers: headers,
    });
  };

  try {
    let response = await makeFetch();

    if (response.status === 401) {
      try {
        await this.refreshToken();
        response = await makeFetch(); // Retry cu token nou
      } catch (refreshError) {
        await this.removeTokensAndRedirectToLogin();
        throw new Error("Autentificare eșuată. Reautentifică-te.");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Eroare API: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error("FormData POST failed:", error);
    throw error;
  }
}

}

export const api = new ApiClient(API_URL);

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem("access_token");
  return !!token;
};

// Tipul poate fi adăugat aici în loc de `any` dacă ai un model definit
export const getCurrentUser = async (): Promise<any | null> => {
  try {
    return await api.get("/users/me");
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
};
