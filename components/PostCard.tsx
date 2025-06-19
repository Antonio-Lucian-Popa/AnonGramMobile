import { Post } from "@/types";
import { useRouter } from "expo-router";
import { MapPin, MessageCircle, Tag, ThumbsDown, ThumbsUp } from "lucide-react-native";
import React from "react";
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { usePostsStore } from "@/store/postsStore";
import { formatRelativeTime } from "@/utils/helpers";

interface PostCardProps {
  post: Post;
  onPress?: () => void;
}

export default function PostCard({ post, onPress }: PostCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { votePost } = usePostsStore();
  
  const handleVote = (voteType: number) => {
    if (!user) return;
    
    votePost({
      postId: post.id,
      userId: user.id,
      voteType: post.currentUserVote === voteType ? 0 : voteType, // Toggle vote
    });
  };
  
  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/post/${post.id}`);
    }
  };
  
  return (
    <Pressable style={styles.container} onPress={handleCardPress}>
      <View style={styles.header}>
        <Text style={styles.alias}>{post.userAlias}</Text>
        <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
      </View>
      
      <Text style={styles.text}>{post.text}</Text>
      
      {post.images && post.images.length > 0 && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: post.images[0] }} 
            style={styles.image} 
            resizeMode="cover"
          />
          {post.images.length > 1 && (
            <View style={styles.moreImagesIndicator}>
              <Text style={styles.moreImagesText}>+{post.images.length - 1}</Text>
            </View>
          )}
        </View>
      )}
      
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          <Tag size={16} color={colors.textSecondary} />
          {post.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>
              {tag}
              {index < post.tags.length - 1 ? ", " : ""}
            </Text>
          ))}
        </View>
      )}
      
      {(post.latitude && post.longitude) && (
        <View style={styles.locationContainer}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={styles.locationText}>Location shared</Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleVote(1)}
            disabled={!user}
          >
            <ThumbsUp 
              size={20} 
              color={post.currentUserVote === 1 ? colors.upvote : colors.inactive} 
              fill={post.currentUserVote === 1 ? colors.upvote : "transparent"}
            />
            <Text style={styles.actionText}>{post.upvotes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleVote(-1)}
            disabled={!user}
          >
            <ThumbsDown 
              size={20} 
              color={post.currentUserVote === -1 ? colors.downvote : colors.inactive} 
              fill={post.currentUserVote === -1 ? colors.downvote : "transparent"}
            />
            <Text style={styles.actionText}>{post.downvotes}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.commentsContainer}>
          <MessageCircle size={20} color={colors.textSecondary} />
          <Text style={styles.commentsText}>{post.commentCount}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  alias: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  time: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  moreImagesIndicator: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moreImagesText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  tag: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  commentsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentsText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
});