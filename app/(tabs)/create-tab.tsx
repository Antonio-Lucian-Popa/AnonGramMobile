import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Button from "@/components/Button";
import { colors } from "@/constants/Colors";

// This is just a placeholder screen since we're using the tab button to navigate to the create modal
export default function CreateTabScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Post</Text>
      <Text style={styles.text}>
        Share your thoughts, questions, or confessions anonymously.
      </Text>
      <Button
        title="Create Post"
        onPress={() => router.push("/create")}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    width: "100%",
    maxWidth: 300,
  },
});