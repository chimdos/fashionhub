import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Importa todas as telas do lojista
import { StoreDashboardScreen } from '../screens/store/DashboardScreen';
import { ProductManagementScreen } from '../screens/store/ProductManagementScreen';
import { CreateProductScreen } from '../screens/store/CreateProductScreen'; // 1. Importa a nova tela
import { EditProductScreen } from '../screens/store/EditProductScreen';     // 2. Importa a nova tela
import { StoreSettingsScreen } from '../screens/store/StoreSettingsScreen';
import { ExploreScreen } from '../screens/client/ExploreScreen'; // Reutilizando

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * --- MUDANÇA IMPORTANTE ---
 * Criamos um StackNavigator para o fluxo de "Meus Produtos".
 * Isso permite que as telas de Criar e Editar abram por cima da lista.
 */
function ProductStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductList" component={ProductManagementScreen} />
      <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
    </Stack.Navigator>
  );
}

// O navegador de abas agora usa o ProductStackNavigator
export function StoreNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'alert-circle-outline';
          if (route.name === 'Explorar') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Requisições') {
            iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
          } else if (route.name === 'Meus Produtos') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Conta') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#28a745', // Cor verde para o lojista
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Explorar" component={ExploreScreen} />
      <Tab.Screen name="Requisições" component={StoreDashboardScreen} />
      {/* 3. A aba "Meus Produtos" agora aponta para a Pilha de Produtos */}
      <Tab.Screen name="Meus Produtos" component={ProductStackNavigator} />
      <Tab.Screen name="Conta" component={StoreSettingsScreen} />
    </Tab.Navigator>
  );
}