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
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import axiosInstance from "./axiosInstance";
import { BRAND_COLOR } from "./config";

const { width } = Dimensions.get('window');

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params || {};

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
      console.log(email);
      const response = await axiosInstance.post("/verify-token", { token, email });

      navigation.navigate("SetNewPassword", { email });

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

  const handleResendCode = async () => {
    try {
      setLoading(true);
      await axiosInstance.post('/forgot-password', { email });
      Alert.alert("Success", "A new verification code has been sent to your email.");
    } catch (error) {
      console.log("Resend Code Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Failed to resend code.");
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
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonCircle}>
              <Icon name="arrow-left" size={20} color={BRAND_COLOR} />
            </View>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Image
                source={require("../assets/sajilo-logo.png")}
                style={styles.logoImage}
              />
            </View>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit verification code to{' '}
              <Text style={styles.emailText}>{email || 'your email'}</Text>
            </Text>

            <View style={styles.formContainer}>
              <TouchableWithoutFeedback onPress={() => inputRef.current.focus()}>
                <View style={styles.otpBoxContainer}>
                  {[0, 1, 2, 3, 4, 5].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.otpBox,
                        token.length === i && styles.activeBox,
                        token[i] && styles.filledBox,
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
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Verify & Continue</Text>
                    <Icon name="arrow-right" size={20} color="#fff" style={styles.buttonIcon} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Didn't receive the code?</Text>
              <TouchableOpacity 
                onPress={handleResendCode}
                activeOpacity={0.7}
                style={styles.resendButton}
              >
                <Text style={styles.resendText}>Resend Code</Text>
                <Icon name="refresh-cw" size={14} color={BRAND_COLOR} style={styles.resendIcon} />
              </TouchableOpacity>
            </View>
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
    backgroundColor: "#F9FAFC",
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
    zIndex: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F4F8",
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  logoBackground: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#EBF4FF",
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoImage: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    borderRadius: 45,
  },
  contentContainer: {
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A202C",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginBottom: 36,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  emailText: {
    fontWeight: '600',
    color: "#4A5568",
  },
  formContainer: {
    width: "100%",
    marginBottom: 32,
  },
  otpBoxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  otpBox: {
    width: width < 380 ? 40 : 48,
    height: width < 380 ? 48 : 56,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  activeBox: {
    borderColor: BRAND_COLOR,
    borderWidth: 2,
    backgroundColor: "#F0F7FF",
  },
  filledBox: {
    borderColor: "#CBD5E0",
    backgroundColor: "#fff",
  },
  otpText: {
    fontSize: 22,
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
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
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
  buttonIcon: {
    marginLeft: 8,
  },
  footerContainer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 8,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  resendText: {
    color: BRAND_COLOR,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 4,
  },
  resendIcon: {
    marginTop: 1,
  },
});