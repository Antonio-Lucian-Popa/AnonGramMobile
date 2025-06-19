import { MapPin, X } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/constants/Colors";
import { getCurrentLocation } from "@/utils/helpers";

interface LocationPickerProps {
  location: { latitude: number; longitude: number } | null;
  onLocationChange: (location: { latitude: number; longitude: number } | null) => void;
}

export default function LocationPicker({
  location,
  onLocationChange,
}: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  
  const handleGetLocation = async () => {
    if (Platform.OS === "web") {
      alert("Location is not fully supported on web");
      return;
    }
    
    setLoading(true);
    try {
      const currentLocation = await getCurrentLocation();
      onLocationChange(currentLocation);
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Failed to get location. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearLocation = () => {
    onLocationChange(null);
  };
  
  return (
    <View style={styles.container}>
      {location ? (
        <View style={styles.locationContainer}>
          <View style={styles.locationInfo}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.locationText}>
              Location added: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
          <TouchableOpacity onPress={handleClearLocation}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleGetLocation}
          disabled={loading}
        >
          <MapPin size={20} color={colors.primary} />
          <Text style={styles.addText}>
            {loading ? "Getting location..." : "Add your location"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationText: {
    marginLeft: 8,
    color: colors.text,
    fontSize: 14,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addText: {
    marginLeft: 8,
    color: colors.primary,
    fontSize: 14,
  },
});