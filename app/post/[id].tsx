import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircle, Send } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { usePostsStore } from "@/store/postsStore";

import Button from "@/components/Button";
import CommentItem from "@/components/CommentItem";
import PostCard from "@/components/PostCard";
import { colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { useCommentsStore } from "@/store/commentStore";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentPost, isLoading: isPostLoading, fetchPostById } = usePostsStore();
  const { comments, isLoading: isCommentsLoading, fetchComments, createComment } = useCommentsStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchPostById(id);
      fetchComments(id, true);
    }
  }, [id]);
  
  const handleSubmitComment = async () => {
    if (!user || !commentText.trim() || !currentPost) {
      if (!isAuthenticated) {
        router.push("/(auth)/login");
      }
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createComment({
        postId: currentPost.id,
        userId: user.id,
        text: commentText.trim(),
      });
      setCommentText("");
    } catch (error) {
      console.error("Submit comment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isPostLoading && !currentPost) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (!currentPost) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Post not found</Text>
        <Text style={styles.errorText}>The post you&apos;re looking for doesn&apos;t exist or has been removed.</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <PostCard post={currentPost} onPress={() => {}} />
        
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Comments</Text>
          <Text style={styles.commentsCount}>{currentPost.commentCount}</Text>
        </View>
        
        {isCommentsLoading && comments.length === 0 ? (
          <ActivityIndicator size="small" color={colors.primary} style={styles.commentsLoader} />
        ) : comments.length === 0 ? (
          <View style={styles.noCommentsContainer}>
            <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
          </View>
        ) : (
          <View style={styles.commentsList}>
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </View>
        )}
      </ScrollView>
      
      {isAuthenticated ? (
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!commentText.trim() || isSubmitting) ? styles.sendButtonDisabled : null,
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.authPromptContainer}>
          <Text style={styles.authPromptText}>Login to join the conversation</Text>
          <Button
            title="Login"
            onPress={() => router.push("/(auth)/login")}
            size="small"
            style={styles.authButton}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  commentsCount: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  commentsLoader: {
    marginVertical: 24,
  },
  noCommentsContainer: {
    padding: 24,
    alignItems: "center",
  },
  noCommentsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  commentsList: {
    marginTop: 8,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.inactive,
  },
  authPromptContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  authPromptText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  authButton: {
    paddingHorizontal: 16,
  },
});