import { colors } from "@/constants/Colors";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";


interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case "primary":
        buttonStyle.backgroundColor = colors.primary;
        break;
      case "secondary":
        buttonStyle.backgroundColor = colors.secondary;
        break;
      case "outline":
        buttonStyle.backgroundColor = "transparent";
        buttonStyle.borderWidth = 1;
        buttonStyle.borderColor = colors.primary;
        break;
      case "danger":
        buttonStyle.backgroundColor = colors.error;
        break;
    }
    
    // Size styles
    switch (size) {
      case "small":
        buttonStyle.paddingVertical = 8;
        buttonStyle.paddingHorizontal = 12;
        break;
      case "medium":
        buttonStyle.paddingVertical = 12;
        buttonStyle.paddingHorizontal = 16;
        break;
      case "large":
        buttonStyle.paddingVertical = 16;
        buttonStyle.paddingHorizontal = 24;
        break;
    }
    
    // Disabled style
    if (disabled || loading) {
      buttonStyle.opacity = 0.6;
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textStyleObj: TextStyle = {};
    
    // Variant text styles
    switch (variant) {
      case "outline":
        textStyleObj.color = colors.primary;
        break;
      default:
        textStyleObj.color = "#fff";
        break;
    }
    
    // Size text styles
    switch (size) {
      case "small":
        textStyleObj.fontSize = 14;
        break;
      case "medium":
        textStyleObj.fontSize = 16;
        break;
      case "large":
        textStyleObj.fontSize = 18;
        break;
    }
    
    return textStyleObj;
  };
  
  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? colors.primary : "#fff"} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontWeight: "600",
  },
});