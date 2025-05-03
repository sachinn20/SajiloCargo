import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import axiosInstance from "./axiosInstance";
import { BRAND_COLOR } from "./config";

const SetNewPasswordScreen = ({ navigation, route }) => {
    const {  email } = route.params || {};

  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetPassword = async () => {
    if (!password || !password_confirmation) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }

    if (password !== password_confirmation) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
        // console.log(email);
      const response = await axiosInstance.post("/reset-password", {
        email,
        password,
        password_confirmation,
      });

      Alert.alert(
        "Password Reset Successful",
        response.data.message || "Your password has been updated successfully.",
        [{ text: "Ok", onPress: () => navigation.navigate("Login") }]
      );
      
    } catch (error) {
      console.log("Set Password Error:", error.response?.data || error.message);

      const errors = error.response?.data?.errors;
      if (errors) {
        const firstField = Object.keys(errors)[0];
        Alert.alert("Validation Error", errors[firstField][0]);
      } else {
        Alert.alert("Error", error.response?.data?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={BRAND_COLOR} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image source={require("../assets/sajilo-logo.png")} style={styles.logoImage} />
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>
              Enter and confirm your new password to reset your account.
            </Text>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#6B7280"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#6B7280"
                secureTextEntry
                value={password_confirmation}
                onChangeText={setPasswordConfirmation}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSetPassword}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SetNewPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoImage: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    borderRadius: 45,
    backgroundColor: "#E6EEF8",
    padding: 10,
  },
  contentContainer: {
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: BRAND_COLOR,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  button: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#A2C4E2",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
