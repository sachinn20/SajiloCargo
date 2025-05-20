import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, 
  ScrollView, LayoutAnimation, Platform, UIManager, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND_COLOR } from './config';
import { useNavigation } from '@react-navigation/native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity 
      style={[styles.faqItem, expanded && styles.faqItemExpanded]} 
      onPress={toggleExpand} 
      activeOpacity={0.8}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <View style={[styles.iconContainer, expanded && styles.iconContainerActive]}>
          <Ionicons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color={expanded ? "#fff" : "#666"} 
          />
        </View>
      </View>
      {expanded && (
        <View style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const ContactCard = ({ icon, text, onPress, subtitle }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.cardIconContainer}>
      <Ionicons name={icon} size={22} color="#fff" />
    </View>
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardText}>{text}</Text>
      {subtitle && <Text style={styles.cardSubtext}>{subtitle}</Text>}
    </View>
    <View style={styles.cardArrow}>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </View>
  </TouchableOpacity>
);

const CustomerSupportScreen = () => {
  const navigation = useNavigation();

  const handleEmail = () => Linking.openURL('mailto:support@sajilocargo.com');
  const handleCall = () => Linking.openURL('tel:+9779800000000');
  const handleWhatsApp = () => Linking.openURL('https://wa.me/9779769816059');
  const handleMap = () => Linking.openURL('https://www.google.com/maps/search/?api=1&query=Herald+College+Kathmandu');
  
  const navigateToChatbot = () => {
    navigation.navigate('SupportBot');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <Ionicons name="headset" size={40} color="#fff" />
          </View>
          <Text style={styles.heading}>How can we help you?</Text>
          <Text style={styles.subheading}>
            Get in touch with our support team through any of the channels below
          </Text>
        </View>

        {/* Contact Cards */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          <ContactCard 
            icon="mail" 
            text="support@sajilocargo.com" 
            subtitle="Email us anytime" 
            onPress={handleEmail} 
          />
          
          <ContactCard 
            icon="call" 
            text="+977-9800000000" 
            subtitle="Available 9 AM - 6 PM" 
            onPress={handleCall} 
          />
          
          <ContactCard 
            icon="logo-whatsapp" 
            text="Chat on WhatsApp" 
            subtitle="Usually replies within an hour" 
            onPress={handleWhatsApp} 
          />
          
          <ContactCard 
            icon="location" 
            text="Sailo Cargo & Logistics" 
            subtitle="Visit our office" 
            onPress={handleMap} 
          />
        </View>

        {/* FAQ Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <FAQItem 
            question="How do I track my package?" 
            answer="Use the Track button from the dashboard or enter your tracking number in the tracking screen. You can also ask our chat assistant to track your package by providing your tracking number." 
          />
          
          <FAQItem 
            question="Can I cancel a booking?" 
            answer="Yes, bookings with status 'pending' can be cancelled from the My Bookings page. Swipe left on the booking card and tap the Delete button, or open the booking details and tap the Cancel button at the bottom." 
          />
          
          <FAQItem 
            question="What payment methods are available?" 
            answer="We currently support Cash on Delivery (COD) and Khalti digital payments. You can select your preferred payment method during the booking process." 
          />
          
          <FAQItem 
            question="Can I reschedule a delivery?" 
            answer="You can edit a pending booking to reschedule its delivery date or time. Go to My Bookings, find your booking, swipe left and tap Edit, or open the booking details and tap the Edit button." 
          />
          
        </View>

        {/* Chat Assistant Section */}
        <View style={styles.chatSection}>
          <View style={styles.chatSectionContent}>
            <View style={styles.chatIconContainer}>
              <Ionicons name="chatbubbles" size={28} color="#fff" />
            </View>
            <View style={styles.chatTextContainer}>
              <Text style={styles.chatTitle}>Need immediate assistance?</Text>
              <Text style={styles.chatSubtitle}>
                Our chatbot is available 24/7 to help with your queries
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={navigateToChatbot}
            style={styles.chatBotButton}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            <Text style={styles.chatBotText}>Chat with Support Bot</Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Sajilo Cargo © {new Date().getFullYear()}
          </Text>
          <Text style={styles.footerSubtext}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerSupportScreen;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 16, 
    backgroundColor: '#fff', 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#222'
  },
  container: { 
    paddingBottom: 40 
  },
  heroSection: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  heading: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#222', 
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 16,
    textAlign: 'center',
    maxWidth: '90%',
    lineHeight: 20,
  },
  sectionContainer: {
    padding: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingLeft: 4,
  },
  card: {
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#fff',
    borderRadius: 12, 
    marginBottom: 12, 
    elevation: 2,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, 
    shadowRadius: 2,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardText: { 
    fontSize: 15, 
    fontWeight: '500',
    color: '#333' 
  },
  cardSubtext: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  cardArrow: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqItem: {
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 10,
    elevation: 1, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, 
    shadowRadius: 2,
    overflow: 'hidden',
  },
  faqItemExpanded: {
    backgroundColor: '#fff',
  },
  faqHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: BRAND_COLOR,
  },
  faqQuestion: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#333',
    flex: 1,
    paddingRight: 8,
  },
  faqAnswerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  faqAnswer: { 
    fontSize: 14, 
    color: '#555',
    lineHeight: 20,
  },
  chatSection: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatSectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chatIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chatTextContainer: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chatSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  chatBotButton: {
    backgroundColor: BRAND_COLOR,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 14, 
    borderRadius: 10,
    elevation: 2,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  chatBotText: {
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '600', 
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});