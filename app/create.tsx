import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import Button from "@/components/Button";
import Input from "@/components/Input";
import TagSelector from "@/components/TagSelector";

import ImagePickerComponent from "@/components/imagePicker";
import LocationPicker from "@/components/LocationPicker";
import { colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { usePostsStore } from "@/store/postsStore";

export default function CreatePostScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { createPost, isLoading } = usePostsStore();

  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [textError, setTextError] = useState("");

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated]);

  const validateForm = () => {
    let isValid = true;

    // Validate text
    if (!text.trim()) {
      setTextError("Post text is required");
      isValid = false;
    } else {
      setTextError("");
    }

    return isValid;
  };

  const handleCreatePost = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to create a post");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {

      // Prepare images if any
      const formData = new FormData();

      // Prepare post data
      const postData = {
        userId: user.id,
        text,
        tags: tags.map(tag => "#" + tag),
        ...(location && { latitude: location.latitude, longitude: location.longitude }),
      };

      console.log("Creating post with data:", postData);

      formData.append("post", JSON.stringify(postData));

      if (images.length > 0) {
        images.forEach(imageUri => {
          const filename = imageUri.split("/").pop() || "image.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";

          // @ts-ignore
          formData.append("images", {
            uri: imageUri,
            name: filename,
            type,
          });
        });
      }

      // Create post
      const newPost = await createPost(formData);

      if (newPost) {
        Alert.alert(
          "Success",
          "Your post has been created successfully",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Create post error:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    }
  };

  const suggestedTags = [
    "confession", "question", "advice", "funny", "serious",
    "relationship", "work", "school", "family", "friends"
  ];

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Post</Text>
          <Text style={styles.subtitle}>Share your thoughts anonymously</Text>

          <Input
            label="What's on your mind?"
            placeholder="Share your thoughts, questions, or confessions..."
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={styles.textInput}
            error={textError}
          />

          <ImagePickerComponent
            images={images}
            onImagesChange={setImages}
            maxImages={5}
          />

          <TagSelector
            selectedTags={tags}
            onTagsChange={setTags}
            suggestedTags={suggestedTags}
          />

          <LocationPicker
            location={location}
            onLocationChange={setLocation}
          />

          <View style={styles.footer}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              style={styles.cancelButton}
            />
            <Button
              title="Post"
              onPress={handleCreatePost}
              loading={isLoading}
              style={styles.postButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  textInput: {
    height: 120,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  postButton: {
    flex: 2,
  },
});