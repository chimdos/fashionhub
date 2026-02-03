import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeWorkerScreen } from '../screens/worker/HomeWorkerScreen';
import { BagDetailScreen } from '../screens/store/BagDetailScreen';
import { WorkerSettingsScreen } from '../screens/worker/WorkerSettingsScreen';
import { WorkerEditProfileScreen } from '../screens/worker/WorkerEditProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const WorkerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#28a745',
        tabBarInactiveTintColor: '#adb5bd',
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
          backgroundColor: '#fff',
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeWorkerScreen}
        options={{
          tabBarLabel: 'Malas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={WorkerSettingsScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const WorkerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={WorkerTabs} />

      <Stack.Screen name="BagDetail" component={BagDetailScreen} />

      <Stack.Screen name="WorkerEditProfile" component={WorkerEditProfileScreen} />
    </Stack.Navigator>
  );
};