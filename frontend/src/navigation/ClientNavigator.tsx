// frontend/src/navigation/ClientNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { HomeScreen } from '../screens/client/HomeScreen';
import { ProductDetailScreen } from '../screens/client/ProductDetailScreen';
import { ExploreScreen } from '../screens/client/ExploreScreen';
import { CartScreen } from '../screens/client/CartScreen';
import { SettingsScreen } from '../screens/client/SettingsScreen';
import { BecomeCourierScreen } from '../screens/client/BecomeCourierScreen';
import { BagSelectionScreen } from '../screens/client/BagSelectionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * 1. Primeiro, criamos as ABAS (Tabs) isoladamente.
 * Contém apenas as telas principais de navegação.
 */
function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#000', // Preto é mais fashion que azul padrão ;)
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'alert-circle-outline';

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
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Explorar" component={ExploreScreen} />
      <Tab.Screen name="Mala" component={CartScreen} />
      <Tab.Screen name="Menu" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

/**
 * 2. Navegador Principal (Stack Global)
 * Esse navegador segura as abas E todas as telas que podem ser abertas
 * de qualquer lugar (como Detalhes de Produto ou Virar Entregador).
 */
export function ClientNavigator() {
  return (
    <Stack.Navigator>
      {/* A tela principal é o conjunto de Abas */}
      <Stack.Screen 
        name="MainTabs" 
        component={ClientTabs} 
        options={{ headerShown: false }} 
      />

      {/* -- Telas Globais (Abrem por cima das abas) -- */}
      
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{ title: 'Detalhes' }}
      />
      
      <Stack.Screen
        name="BecomeCourierScreen"
        component={BecomeCourierScreen}
        options={{ title: 'Trabalhe Conosco' }}
      />
      
      <Stack.Screen
        name="BagSelection"
        component={BagSelectionScreen}
        options={{ title: 'Provador em Casa 🏠' }}
      />

    </Stack.Navigator>
  );
}