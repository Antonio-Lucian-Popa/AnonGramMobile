import { usePostsStore } from "@/store/postsStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import FilterBar from "@/components/FilterBar";
import PostCard from "@/components/PostCard";
import { colors } from "@/constants/Colors";

export default function HomeScreen() {
  const router = useRouter();
  const { posts, isLoading, fetchPosts, fetchMorePosts, setFilters, filters } = usePostsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(true);
    setRefreshing(false);
  };
  
  const handleLoadMore = () => {
    if (!isLoading) {
      fetchMorePosts();
    }
  };
  
  const handleSearch = (text: string) => {
    setSearchText(text);
    setFilters({ search: text });
    fetchPosts(true);
  };
  
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    fetchPosts(true);
  };
  
  const renderFooter = () => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AnonGram</Text>
        <Text style={styles.subtitle}>Share your thoughts anonymously</Text>
      </View>
      
      <FilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />
      
      <FlatList
        data={posts}
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
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <>
                <Text style={styles.emptyTitle}>No posts found</Text>
                <Text style={styles.emptyText}>
                  Be the first to share your thoughts!
                </Text>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
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
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
});