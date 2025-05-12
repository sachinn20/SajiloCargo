import React, { useEffect } from 'react';
import { SafeAreaView, View, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../utils/axiosInstance';

const KhaltiPaymentWebView = ({ route, navigation }) => {
  const { paymentUrl, pidx, bookingId } = route.params;

  const handleNavigationChange = async (navState) => {
    const returnUrlHost = 'verify-payment'; // match part of your return_url

    if (navState.url.includes(returnUrlHost)) {
      const token = await AsyncStorage.getItem('authToken');
      try {
        const res = await axios.post('/khalti/lookup', {
          pidx,
          booking_id: bookingId,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Alert.alert("✅ Payment Success", "Your booking has been confirmed.");
        navigation.popToTop();
      } catch (err) {
        console.error(err.response?.data || err.message);
        Alert.alert("❌ Payment Verification Failed", "We couldn't confirm your payment.");
        navigation.goBack();
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
        renderLoading={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#7B3FA0" />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default KhaltiPaymentWebView;
