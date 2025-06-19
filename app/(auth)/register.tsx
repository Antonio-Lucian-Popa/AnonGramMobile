import Button from "@/components/Button";
import Input from "@/components/Input";
import { colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";


import { generateRandomAlias } from "@/utils/helpers";
import { useRouter } from "expo-router";
import { ArrowLeft, Lock, Mail, User } from "lucide-react-native";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alias, setAlias] = useState(generateRandomAlias());
  
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [aliasError, setAliasError] = useState("");
  
  const validateForm = () => {
    let isValid = true;
    
    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email is invalid");
      isValid = false;
    } else {
      setEmailError("");
    }
    
    // Validate password
    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }
    
    // Validate alias
    if (!alias.trim()) {
      setAliasError("Alias is required");
      isValid = false;
    } else {
      setAliasError("");
    }
    
    return isValid;
  };
  
  const handleRegister = async () => {
    if (validateForm()) {
      try {
        await register({
          email,
          password,
          alias,
          userRole: "USER",
        });
        router.replace("/(tabs)");
      } catch (error) {
        console.error("Registration error:", error);
      }
    }
  };
  
  const generateNewAlias = () => {
    setAlias(generateRandomAlias());
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join AnonGram and share anonymously</Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            leftIcon={<Mail size={20} color={colors.textSecondary} />}
          />
          
          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={passwordError}
            leftIcon={<Lock size={20} color={colors.textSecondary} />}
          />
          
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={confirmPasswordError}
            leftIcon={<Lock size={20} color={colors.textSecondary} />}
          />
          
          <View style={styles.aliasContainer}>
            <Input
              label="Anonymous Alias"
              placeholder="Your anonymous identity"
              value={alias}
              onChangeText={setAlias}
              error={aliasError}
              leftIcon={<User size={20} color={colors.textSecondary} />}
              containerStyle={styles.aliasInput}
            />
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={generateNewAlias}
            >
              <Text style={styles.generateText}>Generate</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.aliasNote}>
            This is your anonymous identity. You can use our generator or create your own.
          </Text>
          
          <Button
            title="Register"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerButton}
          />
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
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
  header: {
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  aliasContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  aliasInput: {
    flex: 1,
    marginBottom: 0,
  },
  generateButton: {
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  generateText: {
    color: colors.primary,
    fontWeight: "600",
  },
  aliasNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    color: colors.textSecondary,
    marginRight: 4,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: "600",
  },
});