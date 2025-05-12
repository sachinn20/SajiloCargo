import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { BRAND_COLOR } from "./config"
import { Ionicons } from "@expo/vector-icons"

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={BRAND_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introContainer}>
          <Text style={styles.subtitle}>Last updated: May, 2025</Text>
          <Text style={styles.text}>
            SajiloCargo values your privacy. This policy explains how we handle and protect your data:
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics-outline" size={22} color={BRAND_COLOR} />
            <Text style={styles.sectionTitle}>1. Data Collection</Text>
          </View>
          <Text style={styles.text}>
            We collect your name, contact, location, and booking details to offer you better services. This includes
            your phone number, email address, pickup and delivery locations, and payment information.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bar-chart-outline" size={22} color={BRAND_COLOR} />
            <Text style={styles.sectionTitle}>2. Usage of Data</Text>
          </View>
          <Text style={styles.text}>
            Your data is used strictly for booking logistics, notifications, and improving user experience. We analyze
            usage patterns to enhance our services and provide personalized recommendations based on your delivery
            history.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="share-social-outline" size={22} color={BRAND_COLOR} />
            <Text style={styles.sectionTitle}>3. Data Sharing</Text>
          </View>
          <Text style={styles.text}>
            We do not sell your data. It may only be shared with vehicle providers involved in your booking. In some
            cases, we may share anonymized data with analytics partners to improve our services. All third-party
            partners are bound by strict confidentiality agreements.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed-outline" size={22} color={BRAND_COLOR} />
            <Text style={styles.sectionTitle}>4. Security</Text>
          </View>
          <Text style={styles.text}>
            We implement secure storage and encrypted communication for sensitive data like passwords. Our systems are
            regularly audited for security vulnerabilities, and we employ industry-standard protection measures to
            safeguard your information from unauthorized access.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={22} color={BRAND_COLOR} />
            <Text style={styles.sectionTitle}>5. Your Rights</Text>
          </View>
          <Text style={styles.text}>
            You have the right to access, update, or delete your data anytime via your profile settings. You can also
            request a complete export of your data or opt out of certain data collection practices while still using our
            core services.
          </Text>
        </View>

        

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using SajiloCargo services, you consent to the data practices described in this privacy policy. For
            questions or concerns, please contact our privacy team at privacy@sajilocargo.com.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PrivacyPolicyScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 40, // To balance the header
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  introContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND_COLOR,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  text: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
    marginTop: 6,
  },
  footer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f0f7ff",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: BRAND_COLOR,
  },
  footerText: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
  },
})
