import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Importe as telas
import { HomeScreen } from '../screens/Cliente/HomeScreen';
import { ExploreScreen } from '../screens/Cliente/ExploreScreen';
import { CartScreen } from '../screens/Cliente/CartScreen';
import { SettingsScreen } from '../screens/Cliente/SettingsScreen';

const Tab = createMaterialTopTabNavigator();

export function ClientNavigator() {
  return (
    // 1. SafeAreaView removido daqui. Adicione-o dentro de cada tela, se necessário.
    <Tab.Navigator
      // 2. A propriedade 'tabBarPosition' foi removida, pois 'top' já é o padrão.
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarIndicatorStyle: {
          backgroundColor: '#007bff',
          height: 3,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName = 'alert-circle-outline';
          const size = 24;

          if (route.name === 'Início') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explorar') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Mala') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'menu' : 'menu-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Explorar" component={ExploreScreen} />
      <Tab.Screen name="Mala" component={CartScreen} />
      <Tab.Screen name="Menu" component={SettingsScreen} />
    </Tab.Navigator>
  );
}