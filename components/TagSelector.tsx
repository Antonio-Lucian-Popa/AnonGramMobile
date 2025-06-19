import { X } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";


import { colors } from "@/constants/Colors";
import Input from "./input";

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestedTags?: string[];
}

export default function TagSelector({
  selectedTags,
  onTagsChange,
  suggestedTags = [],
}: TagSelectorProps) {
  const [tagInput, setTagInput] = useState("");
  
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim().toLowerCase();
    if (!selectedTags.includes(newTag)) {
      onTagsChange([...selectedTags, newTag]);
    }
    
    setTagInput("");
  };
  
  const handleRemoveTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };
  
  const handleSelectSuggestedTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Input
          placeholder="Add tags..."
          value={tagInput}
          onChangeText={setTagInput}
          onSubmitEditing={handleAddTag}
          returnKeyType="done"
        />
      </View>
      
      {selectedTags.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScrollView}
          contentContainerStyle={styles.tagsContainer}
        >
          {selectedTags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tagChip}
              onPress={() => handleRemoveTag(tag)}
            >
              <Text style={styles.tagText}>{tag}</Text>
              <X size={16} color="#fff" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      {suggestedTags.length > 0 && (
        <View>
          <Text style={styles.suggestedTitle}>Suggested tags:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.suggestedScrollView}
            contentContainerStyle={styles.suggestedContainer}
          >
            {suggestedTags
              .filter(tag => !selectedTags.includes(tag))
              .map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestedChip}
                  onPress={() => handleSelectSuggestedTag(tag)}
                >
                  <Text style={styles.suggestedText}>{tag}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 8,
  },
  tagsScrollView: {
    maxHeight: 40,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
  },
  tagChip: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    color: "#fff",
    marginRight: 4,
  },
  suggestedTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  suggestedScrollView: {
    maxHeight: 40,
  },
  suggestedContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
  },
  suggestedChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  suggestedText: {
    color: colors.text,
  },
});