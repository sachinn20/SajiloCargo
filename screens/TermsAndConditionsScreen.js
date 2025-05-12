import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { BRAND_COLOR } from "./config"
import { Ionicons } from "@expo/vector-icons"

const TermsAndConditionsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={BRAND_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introContainer}>
          <Text style={styles.subtitle}>Last updated: May, 2025</Text>
          <Text style={styles.text}>
            Welcome to SajiloCargo. By using our services, you agree to the following terms:
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={22} color={BRAND_COLOR} />
            <Text style={styles.sectionTitle}>1. Booking Responsibility</Text>
          </View>
          <Text style={styles.text}>
            Users are responsible for the accuracy of the booking information provided. Incorrect information may result
            in cancellation or additional charges.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="close-circle-outline" size={22} color={BRAND_COLOR} />
            <Text style={styles.sectionTitle}>2. Cancellations</Text>
          </View>
          <Text style={styles.text}>
           You may cancel a booking anytime before it is accepted. Once the booking is accepted by a vehicle provider, cancellation will no longer be possible.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={22} color={BRAND_COLOR} />
            <Text style={styles.sectionTitle}>3. Payments</Text>
          </View>
          <Text style={styles.text}>
            All payments must be completed using the available methods. For instant bookings, payment is required upon delivery. You can pay via Cash or Khalti. 
            If choosing Khalti, payment will only be available after your booking request is accepted by the rider.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle-outline" size={22} color={BRAND_COLOR} />
            <Text style={styles.sectionTitle}>4. Package Restrictions</Text>
          </View>
          <Text style={styles.text}>
            Illegal, hazardous, or restricted items are not allowed. SajiloCargo holds the right to refuse delivery of
            such packages.
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-outline" size={22} color={BRAND_COLOR} />
            <Text style={styles.sectionTitle}>5. Liability</Text>
          </View>
          <Text style={styles.text}>
            SajiloCargo is not liable for damages due to unforeseen delays, incorrect addresses, or misrepresented items
            unless insurance is included.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing to use our services, you acknowledge that you have read and understood these terms.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default TermsAndConditionsScreen

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
