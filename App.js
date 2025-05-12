import React from 'react';
import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import SetNewPasswordScreen from './screens/SetNewPasswordScreen';

import AboutUsScreen from './screens/AboutUsScreen';
import NotificationScreen from './screens/NotificationScreen';

import CustomerDashboardScreen from './screens/CustomerDashboardScreen';
import TripSearchScreen from './screens/TripSearchScreen';
import TrackScreen from './screens/TrackScreen';
import PackageInfoScreen from './screens/PackageInfoScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchResultsScreen from './screens/SearchResultsScreen';
import InstantBookingScreen from './screens/InstantBookingScreen';
import InstantResultsScreen from './screens/InstantResultsScreen';
import CustomerEditProfileScreen from './screens/CustomerEditProfileScreen';
import CustomerMyBookingScreen from './screens/CustomerMyBookingScreen';
import CustomerBookingEditScreen from './screens/CustomerBookingEditScreen';

import ChangePasswordScreen from './screens/ChangePasswordScreen';
import VehicleownerChangePasswordScreen from './screens/VehicleownerChangePasswordScreen';



import TermsAndConditionsScreen from './screens/TermsAndConditionsScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';


import VehicleOwnerTabs from './screens/VehicleOwnerTabs';
import VehicleManagementScreen from './screens/VehicleManagementScreen';
import AddVehicleScreen from './screens/AddVehicleScreen';
import TripManagementScreen from './screens/TripManagementScreen';
import AddTripScreen from './screens/AddTripScreen';
import OwnerBookingsScreen from './screens/OwnerBookingsScreen';
import VehicleOwnerEditProfileScreen from './screens/VehicleOwnerEditProfileScreen';

import PaymentOptionsScreen from './screens/PaymentOptionsScreen';
import KhaltiPaymentWebView from './screens/KhaltiPaymentWebView';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { BRAND_COLOR } from './screens/config';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Customer Bottom Tabs
// Customer Bottom Tabs
const CustomerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarHideOnKeyboard: true,
      tabBarStyle: {
        backgroundColor: '#fff',
        height: 90,
        paddingBottom: 30,
        paddingTop: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
      tabBarActiveTintColor: BRAND_COLOR,
      tabBarInactiveTintColor: 'gray',
      tabBarIcon: ({ color }) => {
        let iconName;
        switch (route.name) {
          case 'Home':
            iconName = 'home-outline';
            break;
          case 'Bookings':
            iconName = 'document-text-outline';
            break;
          case 'Track':
            iconName = 'navigate-outline';
            break;
          case 'Profile':
            iconName = 'person-outline';
            break;
          default:
            iconName = 'ellipse';
        }
        return <Icon name={iconName} size={24} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={CustomerDashboardScreen} />
    <Tab.Screen name="Bookings" component={CustomerMyBookingScreen} />
    <Tab.Screen name="Track" component={TrackScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);


export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
              <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen} />

              <Stack.Screen name="Terms" component={TermsAndConditionsScreen} />
              <Stack.Screen name="Privacy" component={PrivacyPolicyScreen} />



              <Stack.Screen name="Notifications" component={NotificationScreen} />
              <Stack.Screen name="AboutUs" component={AboutUsScreen} />


              <Stack.Screen name="Dashboard" component={CustomerTabs} />
              <Stack.Screen name="TripSearch" component={TripSearchScreen} />
              <Stack.Screen name="InstantBooking" component={InstantBookingScreen} />
              <Stack.Screen name="InstantResults" component={InstantResultsScreen} />
              <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
              <Stack.Screen name="PackageInfoScreen" component={PackageInfoScreen} />
              <Stack.Screen name="CustomerEditProfile" component={CustomerEditProfileScreen} />
              <Stack.Screen name="MyBookings" component={CustomerMyBookingScreen} />
              <Stack.Screen name="EditBooking" component={CustomerBookingEditScreen} />

              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
               <Stack.Screen name="VehicleOwnerChangePassword" component={VehicleownerChangePasswordScreen} />



              <Stack.Screen name="OwnerDashboard" component={VehicleOwnerTabs} />
              <Stack.Screen name="VehicleManagement" component={VehicleManagementScreen} />
              <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
              <Stack.Screen name="TripManagement" component={TripManagementScreen} />
              <Stack.Screen name="AddTrip" component={AddTripScreen} />
              <Stack.Screen name="OwnerBookings" component={OwnerBookingsScreen} />
              <Stack.Screen name="VehicleOwnerEditProfile" component={VehicleOwnerEditProfileScreen} />

              <Stack.Screen name="PaymentOptions" component={PaymentOptionsScreen} />
              <Stack.Screen name="KhaltiPaymentWebView" component={KhaltiPaymentWebView} />
              


            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
