import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { CourierDashboardScreen } from '../screens/courier/CourierDashboardScreen';
import { CourierEarningsScreen } from '../screens/courier/CourierEarningsScreen';
import { CourierSettingsScreen } from '../screens/courier/CourierSettingsScreen';
import { CourierEditProfileScreen } from '../screens/courier/CourierEditProfileScreen';
import { CourierChangePasswordScreen } from '../screens/courier/CourierChangePasswordScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="CourierSettingsScreen"
        component={CourierSettingsScreen}
      />
      <Stack.Screen
        name="CourierEditProfileScreen"
        component={CourierEditProfileScreen}
        options={{
          headerShown: true,
          title: 'Editar Perfil',
          headerTintColor: '#28a745',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen
        name="CourierChangePasswordScreen"
        component={CourierChangePasswordScreen}
        options={{ headerShown: true, title: 'Segurança' }}
      />
    </Stack.Navigator>
  );
}

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
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}