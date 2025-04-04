// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper'; // 

import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import NotificationScreen from './screens/NotificationScreen';

import CustomerDashboardScreen from './screens/CustomerDashboardScreen';
import TripSearchScreen from './screens/TripSearchScreen';
import WalletScreen from './screens/WalletScreen';
import TrackScreen from './screens/TrackScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchResultsScreen from './screens/SearchResultsScreen';

import VehicleOwnerTabs from './screens/VehicleOwnerTabs';
import VehicleManagementScreen from './screens/VehicleManagementScreen';
import AddVehicleScreen from './screens/AddVehicleScreen';
import TripManagementScreen from './screens/TripManagementScreen';
import AddTripScreen from './screens/AddTripScreen';
import OwnerBookingsScreen from './screens/OwnerBookingsScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { BRAND_COLOR } from './screens/config';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
          case 'Wallet':
            iconName = 'wallet-outline';
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
    <Tab.Screen name="Wallet" component={WalletScreen} />
    <Tab.Screen name="Track" component={TrackScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default function App() {
  return (
    <PaperProvider> 
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Notifications" component={NotificationScreen} />
          <Stack.Screen name="Dashboard" component={CustomerTabs} />
          <Stack.Screen name="TripSearch" component={TripSearchScreen} options={{ title: 'Search Trips' }} />
          <Stack.Screen name="OwnerDashboard" component={VehicleOwnerTabs} />
          <Stack.Screen name="VehicleManagement" component={VehicleManagementScreen} />
          <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
          <Stack.Screen name="TripManagement" component={TripManagementScreen} />
          <Stack.Screen name="AddTrip" component={AddTripScreen} />
          <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
          <Tab.Screen name="OwnerBookings" component={OwnerBookingsScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </PaperProvider> 
  );
}
