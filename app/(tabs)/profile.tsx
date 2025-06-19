import { useAuthStore } from "@/store/authStore";
import { usePostsStore } from "@/store/postsStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import Button from "@/components/Button";
import PostCard from "@/components/PostCard";
import { colors } from "@/constants/Colors";
import { Post } from "@/types";
import { LogOut, User } from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { posts, isLoading, fetchPosts, fetchMorePosts } = usePostsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch user's posts
      fetchUserPosts();
    }
  }, [isAuthenticated, user]);
  
  const fetchUserPosts = async () => {
    // In a real app, you would fetch user's posts from the API
    // For now, we'll filter the existing posts
    if (user) {
      const filteredPosts = posts.filter(post => post.userId === user.id);
      setUserPosts(filteredPosts);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(true);
    fetchUserPosts();
    setRefreshing(false);
  };
  
  const handleLoadMore = () => {
    if (!isLoading) {
      fetchMorePosts();
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => logout(),
        },
      ]
    );
  };
  
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authContainer}>
          <User size={64} color={colors.textSecondary} />
          <Text style={styles.authTitle}>Not Logged In</Text>
          <Text style={styles.authText}>
            Login or create an account to view your profile and posts.
          </Text>
          <Button
            title="Login"
            onPress={() => router.push("/(auth)/login")}
            style={styles.authButton}
          />
          <Button
            title="Register"
            variant="outline"
            onPress={() => router.push("/(auth)/register")}
            style={styles.authButton}
          />
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.alias?.charAt(0) || "A"}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user?.alias || "Anonymous"}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>
        <Button
          title="Logout"
          variant="outline"
          size="small"
          onPress={handleLogout}
          icon={<LogOut size={16} color={colors.primary} style={{ marginRight: 4 }} />}
        />
      </View>
      
      <View style={styles.postsHeader}>
        <Text style={styles.postsTitle}>Your Posts</Text>
      </View>
      
      <FlatList
        data={userPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <>
                <Text style={styles.emptyTitle}>No posts yet</Text>
                <Text style={styles.emptyText}>
                  Your posts will appear here. Start sharing your thoughts!
                </Text>
                <Button
                  title="Create Post"
                  onPress={() => router.push("/create")}
                  style={styles.createButton}
                />
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  postsHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    width: "100%",
    maxWidth: 200,
  },
  authContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  authText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  authButton: {
    width: "100%",
    marginBottom: 12,
  },
});