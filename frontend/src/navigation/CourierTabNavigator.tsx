import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CourierDashboardScreen } from '../screens/courier/CourierDashboardScreen';
import { CourierEarningsScreen } from '../screens/courier/CourierEarningsScreen';

const Placeholder = () => <View />; 

const Tab = createBottomTabNavigator();

export function CourierTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#28a745',
        tabBarInactiveTintColor: '#ADB5BD',
        tabBarStyle: { height: 65, paddingBottom: 10, paddingTop: 10 }
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={CourierDashboardScreen} 
        options={{
          tabBarLabel: 'Corridas',
          tabBarIcon: ({ color, size }) => <Ionicons name="flash" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="History" 
        component={CourierEarningsScreen} 
        options={{
          tabBarLabel: 'Ganhos',
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Placeholder} 
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}