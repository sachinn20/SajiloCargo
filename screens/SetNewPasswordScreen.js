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
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import axiosInstance from "./axiosInstance";
import { BRAND_COLOR } from "./config";

const { width } = Dimensions.get('window');

const SetNewPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params || {};

  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  
      const errMsg = error.response?.data?.message;
      const errors = error.response?.data?.errors;
  
      if (errMsg === "You cannot use your old password.") {
        Alert.alert("Error", errMsg);
      } else if (errors) {
        const firstField = Object.keys(errors)[0];
        Alert.alert("Validation Error", errors[firstField][0]);
      } else {
        Alert.alert("Error", errMsg || "Something went wrong.");
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
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
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
              <Image source={require("../assets/sajilo-logo.png")} style={styles.logoImage} />
            </View>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
              Your new password must be different from previously used passwords and at least 8 characters long.
            </Text>

            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="#A0AEC0"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor="#A0AEC0"
                  secureTextEntry={!showConfirmPassword}
                  value={password_confirmation}
                  onChangeText={setPasswordConfirmation}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>Password must contain:</Text>
                <View style={styles.requirementItem}>
                  <Icon 
                    name={password.length >= 8 ? "check-circle" : "circle"} 
                    size={16} 
                    color={password.length >= 8 ? "#48BB78" : "#CBD5E0"} 
                    style={styles.requirementIcon} 
                  />
                  <Text style={[
                    styles.requirementText,
                    password.length >= 8 && styles.requirementMet
                  ]}>
                    At least 8 characters
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Icon 
                    name={/[A-Z]/.test(password) ? "check-circle" : "circle"} 
                    size={16} 
                    color={/[A-Z]/.test(password) ? "#48BB78" : "#CBD5E0"} 
                    style={styles.requirementIcon} 
                  />
                  <Text style={[
                    styles.requirementText,
                    /[A-Z]/.test(password) && styles.requirementMet
                  ]}>
                    At least one uppercase letter
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Icon 
                    name={/[0-9]/.test(password) ? "check-circle" : "circle"} 
                    size={16} 
                    color={/[0-9]/.test(password) ? "#48BB78" : "#CBD5E0"} 
                    style={styles.requirementIcon} 
                  />
                  <Text style={[
                    styles.requirementText,
                    /[0-9]/.test(password) && styles.requirementMet
                  ]}>
                    At least one number
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSetPassword}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Reset Password</Text>
                    <Icon name="check" size={20} color="#fff" style={styles.buttonIcon} />
                  </>
                )}
              </TouchableOpacity>
            </View>
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
  formContainer: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 8,
    marginLeft: 4,
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
  eyeIcon: {
    padding: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  passwordRequirements: {
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requirementIcon: {
    marginRight: 8,
  },
  requirementText: {
    fontSize: 14,
    color: "#718096",
  },
  requirementMet: {
    color: "#48BB78",
    fontWeight: "500",
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
});