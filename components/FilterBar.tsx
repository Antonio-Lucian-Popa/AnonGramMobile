import { Filter, MapPin, Search, Tag, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/constants/Colors";
import { PostFilters } from "@/types";
import Button from "./Button";
import Input from "./input";


interface FilterBarProps {
  filters: PostFilters;
  onFiltersChange: (filters: PostFilters) => void;
  onSearch: (search: string) => void;
  popularTags?: string[];
}

export default function FilterBar({
  filters,
  onFiltersChange,
  onSearch,
  popularTags = ["confession", "question", "advice", "funny", "serious"],
}: FilterBarProps) {
  const [searchText, setSearchText] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<PostFilters>(filters);
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);
  
  const handleSearch = () => {
    onSearch(searchText);
  };
  
  const openFilters = () => {
    setTempFilters(filters);
    setSelectedTags(filters.tags || []);
    setShowFilters(true);
  };
  
  const applyFilters = () => {
    onFiltersChange({
      ...tempFilters,
      tags: selectedTags,
    });
    setShowFilters(false);
  };
  
  const resetFilters = () => {
    setTempFilters({});
    setSelectedTags([]);
  };
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const setRadius = (radius: number) => {
    setTempFilters({
      ...tempFilters,
      radius,
    });
  };
  
  const hasActiveFilters = () => {
    return (
      (filters.tags && filters.tags.length > 0) ||
      filters.radius !== undefined
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search posts..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          leftIcon={<Search size={20} color={colors.textSecondary} />}
          containerStyle={styles.searchInput}
        />
        <TouchableOpacity 
          style={[
            styles.filterButton,
            hasActiveFilters() ? styles.filterButtonActive : null,
          ]} 
          onPress={openFilters}
        >
          <Filter size={20} color={hasActiveFilters() ? "#fff" : colors.text} />
        </TouchableOpacity>
      </View>
      
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Posts</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>By Tags</Text>
              <View style={styles.tagsContainer}>
                {popularTags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tagChip,
                      selectedTags.includes(tag) ? styles.tagChipSelected : null,
                    ]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Tag 
                      size={16} 
                      color={selectedTags.includes(tag) ? "#fff" : colors.text} 
                    />
                    <Text 
                      style={[
                        styles.tagText,
                        selectedTags.includes(tag) ? styles.tagTextSelected : null,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.sectionTitle}>By Distance</Text>
              <View style={styles.distanceContainer}>
                <TouchableOpacity
                  style={[
                    styles.distanceChip,
                    tempFilters.radius === 1 ? styles.distanceChipSelected : null,
                  ]}
                  onPress={() => setRadius(1)}
                >
                  <Text 
                    style={[
                      styles.distanceText,
                      tempFilters.radius === 1 ? styles.distanceTextSelected : null,
                    ]}
                  >
                    1 km
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.distanceChip,
                    tempFilters.radius === 5 ? styles.distanceChipSelected : null,
                  ]}
                  onPress={() => setRadius(5)}
                >
                  <Text 
                    style={[
                      styles.distanceText,
                      tempFilters.radius === 5 ? styles.distanceTextSelected : null,
                    ]}
                  >
                    5 km
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.distanceChip,
                    tempFilters.radius === 10 ? styles.distanceChipSelected : null,
                  ]}
                  onPress={() => setRadius(10)}
                >
                  <Text 
                    style={[
                      styles.distanceText,
                      tempFilters.radius === 10 ? styles.distanceTextSelected : null,
                    ]}
                  >
                    10 km
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.distanceChip,
                    tempFilters.radius === 50 ? styles.distanceChipSelected : null,
                  ]}
                  onPress={() => setRadius(50)}
                >
                  <Text 
                    style={[
                      styles.distanceText,
                      tempFilters.radius === 50 ? styles.distanceTextSelected : null,
                    ]}
                  >
                    50 km
                  </Text>
                </TouchableOpacity>
              </View>
              
              {tempFilters.radius && (
                <View style={styles.locationNote}>
                  <MapPin size={16} color={colors.primary} />
                  <Text style={styles.locationNoteText}>
                    This will use your current location
                  </Text>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Reset"
                variant="outline"
                onPress={resetFilters}
                style={styles.resetButton}
              />
              <Button
                title="Apply Filters"
                onPress={applyFilters}
                style={styles.applyButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filterButton: {
    marginLeft: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  modalBody: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    marginLeft: 4,
    color: colors.text,
  },
  tagTextSelected: {
    color: "#fff",
  },
  distanceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  distanceChip: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  distanceChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  distanceText: {
    color: colors.text,
  },
  distanceTextSelected: {
    color: "#fff",
  },
  locationNote: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationNoteText: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 2,
  },
});