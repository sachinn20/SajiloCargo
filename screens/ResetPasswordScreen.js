import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import axiosInstance from "./axiosInstance";
import { BRAND_COLOR } from "./config";

const ResetPasswordScreen = ({ navigation }) => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [cursorVisible, setCursorVisible] = useState(true);

  // 🔁 Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyToken = async () => {
    if (token.length !== 6) {
      Alert.alert("Error", "Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/verify-token", { token });

      Alert.alert("Success", response.data.message, [
        {
          text: "Continue",
          onPress: () => navigation.navigate("SetNewPassword", { token }),
        },
      ]);
    } catch (error) {
      console.log("Token Verify Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value) => {
    const filtered = value.replace(/[^0-9]/g, "");
    if (filtered.length <= 6) {
      setToken(filtered);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={BRAND_COLOR} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/sajilo-logo.png")}
              style={styles.logoImage}
            />
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.title}>Verify Token</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit token sent to your email to continue.
            </Text>

            <TouchableWithoutFeedback onPress={() => inputRef.current.focus()}>
              <View style={styles.otpBoxContainer}>
                {[0, 1, 2, 3, 4, 5].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.otpBox,
                      token.length === i && styles.activeBox,
                    ]}
                  >
                    <Text style={styles.otpText}>
                      {token[i]
                        ? token[i]
                        : token.length === i && cursorVisible
                        ? "|"
                        : ""}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableWithoutFeedback>

            <TextInput
              ref={inputRef}
              value={token}
              onChangeText={handleChange}
              keyboardType="numeric"
              maxLength={6}
              style={styles.hiddenInput}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyToken}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify Token</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

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
  otpBoxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activeBox: {
    borderColor: BRAND_COLOR,
    borderWidth: 2,
  },
  otpText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  hiddenInput: {
    height: 0,
    width: 0,
    position: "absolute",
    opacity: 0,
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
