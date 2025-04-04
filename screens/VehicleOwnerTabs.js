// screens/VehicleOwnerTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import VehicleOwnerDashboardScreen from './VehicleOwnerDashboardScreen';
import OwnerBookingsScreen from './OwnerBookingsScreen';
import EarningsScreen from './EarningsScreen';
import VehicleOwnerProfileScreen from './VehicleOwnerProfileScreen';
import { BRAND_COLOR } from './config';

const Tab = createBottomTabNavigator();

const VehicleOwnerTabs = () => (
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
        elevation: 10,              // Android shadow
        shadowColor: '#000',        // iOS shadow
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
          case 'Dashboard':
            iconName = 'grid-outline';
            break;
          case 'Bookings':
            iconName = 'clipboard-outline';
            break;
          case 'Earnings':
            iconName = 'cash-outline';
            break;
          case 'Profile':
            iconName = 'person-outline';
            break;
          default:
            iconName = 'ellipse';
        }

        return <Ionicons name={iconName} size={24} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={VehicleOwnerDashboardScreen} />
    <Tab.Screen name="Bookings" component={OwnerBookingsScreen} />
    <Tab.Screen name="Earnings" component={EarningsScreen} />
    <Tab.Screen name="Profile" component={VehicleOwnerProfileScreen} />
  </Tab.Navigator>
);

export default VehicleOwnerTabs;
