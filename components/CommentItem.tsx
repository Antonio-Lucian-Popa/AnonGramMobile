
import { colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { useCommentsStore } from "@/store/commentStore";

import { Comment } from "@/types";
import { formatRelativeTime } from "@/utils/helpers";
import { Trash2 } from "lucide-react-native";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const { user } = useAuthStore();
  const { deleteComment } = useCommentsStore();
  
  const isOwner = user?.id === comment.userId;
  
  const handleDelete = () => {
    if (!user) return;
    
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteComment(comment.id, user.id),
        },
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.alias}>{comment.userAlias}</Text>
        <View style={styles.rightHeader}>
          <Text style={styles.time}>{formatRelativeTime(comment.createdAt)}</Text>
          {isOwner && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Trash2 size={16} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.text}>{comment.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  alias: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  text: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});