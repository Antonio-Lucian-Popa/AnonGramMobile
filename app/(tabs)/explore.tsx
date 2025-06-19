import { usePostsStore } from "@/store/postsStore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import FilterBar from "@/components/FilterBar";
import PostCard from "@/components/PostCard";
import { colors } from "@/constants/Colors";
import { getCurrentLocation } from "@/utils/helpers";

export default function ExploreScreen() {
  const { posts, isLoading, fetchPosts, fetchMorePosts, setFilters, filters, resetFilters } = usePostsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  useEffect(() => {
    // Reset filters when entering explore screen
    resetFilters();
    fetchPosts(true);
    
    // Try to get user location for nearby posts
    getCurrentLocation().then(location => {
      if (location) {
        setFilters({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        fetchPosts(true);
      }
    });
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
  
  const popularTags = [
    "confession", "question", "advice", "funny", "serious", 
    "relationship", "work", "school", "family", "friends"
  ];
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover posts from around you</Text>
      </View>
      
      <FilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        popularTags={popularTags}
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
                  Try adjusting your filters or search terms
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