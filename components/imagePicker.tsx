import { Upload, X } from "lucide-react-native";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/constants/Colors";
import { pickImage } from "@/utils/helpers";

interface ImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImagePickerComponent({
  images,
  onImagesChange,
  maxImages = 5,
}: ImagePickerProps) {
  const handleAddImage = async () => {
    if (images.length >= maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }
    
    const imageUri = await pickImage();
    if (imageUri) {
      onImagesChange([...images, imageUri]);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}
            >
              <X size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        
        {images.length < maxImages && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddImage}>
            <Upload size={24} color={colors.primary} />
            <Text style={styles.addText}>Add Image</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    padding: 4,
  },
  addButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.card,
  },
  addText: {
    color: colors.primary,
    marginTop: 4,
    fontSize: 12,
  },
});