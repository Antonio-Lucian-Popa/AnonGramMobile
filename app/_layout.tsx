import { useAuthStore } from "@/store/authStore";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This function checks if the user is authenticated and redirects accordingly
function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    
    // Define protected routes that require authentication
    const protectedRoutes = ["create", "post"];
    // Ensure segments is an array of strings
    const segmentStrings = Array.isArray(segments) ? segments as string[] : [];
    const isProtectedRoute = protectedRoutes.some(route => 
      segmentStrings.includes(route) || segmentStrings.some(segment => segment.startsWith(route + "/"))
    );
    
    if (
      // If the user is not authenticated and trying to access a protected route
      !isAuthenticated && 
      isProtectedRoute &&
      !inAuthGroup
    ) {
      // Redirect to the login page
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // If the user is authenticated and trying to access auth pages, redirect to home
      router.replace("/");
    }
  }, [isAuthenticated, segments]);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const { isAuthenticated, getCurrentUser } = useAuthStore();
  
  // Use the custom hook to protect routes
  useProtectedRoute(isAuthenticated);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      
      // Try to restore user session
      getCurrentUser().catch(err => {
        console.log("No active session found");
      });
    }
  }, [loaded, getCurrentUser]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="(auth)/login" 
        options={{ 
          headerShown: false,
          presentation: Platform.OS === "ios" ? "modal" : "card",
        }} 
      />
      <Stack.Screen 
        name="(auth)/register" 
        options={{ 
          headerShown: false,
          presentation: Platform.OS === "ios" ? "modal" : "card",
        }} 
      />
      <Stack.Screen 
        name="post/[id]" 
        options={{ 
          title: "Post Details",
          headerBackTitle: "Back",
        }} 
      />
      <Stack.Screen 
        name="create" 
        options={{ 
          title: "Create Post",
          headerBackTitle: "Cancel",
          presentation: "modal",
        }} 
      />
    </Stack>
  );
}