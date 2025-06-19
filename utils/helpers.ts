import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Platform } from "react-native";

// Generate a random alias for anonymous users
export function generateRandomAlias(): string {
  const adjectives = [
    "Anonymous", "Mysterious", "Hidden", "Secret", "Shadowy", "Veiled", 
    "Masked", "Covert", "Unseen", "Invisible", "Enigmatic", "Cryptic"
  ];
  
  const nouns = [
    "User", "Person", "Entity", "Being", "Individual", "Soul", 
    "Mind", "Thinker", "Voice", "Presence", "Wanderer", "Ghost"
  ];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

// Format date to relative time (e.g., "2 hours ago")
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
}

// Pick image from library
export async function pickImage(): Promise<string | null> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return null;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error("Error picking image:", error);
    return null;
  }
}

// Get current location
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    if (Platform.OS === "web") {
      return null; // Location not fully supported on web
    }
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return null;
    }
    
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
}

// Create form data for image upload
export function createImageFormData(imageUri: string): FormData {
  const formData = new FormData();
  const filename = imageUri.split("/").pop() || "image.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";
  
  // @ts-ignore
  formData.append("images", {
    uri: imageUri,
    name: filename,
    type,
  });
  
  return formData;
}