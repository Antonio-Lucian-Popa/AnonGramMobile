import { Tabs, useRouter } from "expo-router";
import { Home, PlusCircle, Search, User } from "lucide-react-native";
import React from "react";

import { colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { TouchableOpacity } from "react-native";

export default function TabLayout() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const handleCreatePost = () => {
    if (isAuthenticated) {
      router.push("/create");
    } else {
      router.push("/(auth)/login");
    }
  };
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-tab"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => <PlusCircle size={24} color={color} />,
          tabBarButton: (props) => {
            // Remove any props with null values to satisfy TouchableOpacityProps
            const filteredProps = Object.fromEntries(
              Object.entries(props).filter(([_, v]) => v !== null)
            );
            return (
              <TouchableOpacity
                {...filteredProps}
                onPress={handleCreatePost}
              />
            );
          },
        }}
        listeners={() => ({
          tabPress: (e) => {
            // Prevent default behavior
            e.preventDefault();
          },
        })}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}