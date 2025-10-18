import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Importe TODAS as telas que o cliente vai usar
// Usando o caminho com 'cliente' em minúsculas para garantir consistência
import { HomeScreen } from '../screens/client/HomeScreen';
import { ProductDetailScreen } from '../screens/client/ProductDetailScreen';
import { ExploreScreen } from '../screens/client/ExploreScreen';
import { CartScreen } from '../screens/client/CartScreen';
import { SettingsScreen } from '../screens/client/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Cria um "Navegador de Pilha" (StackNavigator) para o fluxo da tela inicial.
 * A razão para isto é permitir que, ao clicar num produto na HomeScreen,
 * a ProductDetailScreen abra "por cima" dela, com um botão de voltar.
 */
function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

/**
 * Este é o componente principal do navegador do cliente.
 * Ele cria o menu de abas na parte inferior da tela.
 */
export function ClientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Esconde o cabeçalho padrão das abas
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'alert-circle-outline'; // Ícone padrão em caso de erro

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
        tabBarActiveTintColor: '#007bff', // Cor do ícone ativo
        tabBarInactiveTintColor: 'gray',   // Cor do ícone inativo
      })}
    >
      {/* A aba "Início" agora aponta para a nossa pilha de navegação da Home */}
      <Tab.Screen name="Início" component={HomeStackNavigator} />
      <Tab.Screen name="Explorar" component={ExploreScreen} />
      <Tab.Screen name="Mala" component={CartScreen} />
      <Tab.Screen name="Menu" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

