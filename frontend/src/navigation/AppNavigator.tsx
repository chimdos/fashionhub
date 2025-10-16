import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Importe TODAS as telas necessárias
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { HomeScreen } from '../screens/Cliente/HomeScreen';
import { ExploreScreen } from '../screens/Cliente/ExploreScreen';
import { CartScreen } from '../screens/Cliente/CartScreen';
import { SettingsScreen } from '../screens/Cliente/SettingsScreen';
import { DashboardScreen as StoreDashboardScreen } from '../screens/Lojista/DashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Navegador para o fluxo do Cliente (com o menu de abas inferior) ---
function ClientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
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

// --- Navegador para o fluxo do Lojista ---
function StoreNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={StoreDashboardScreen} />
      {/* Adicione outras abas para o lojista aqui */}
    </Tab.Navigator>
  );
}

// --- Componente principal que decide qual fluxo mostrar ---
export const AppNavigator = () => {
  const { user, token, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token || !user ? (
        // Se NÃO estiver logado, mostra a tela de Login
        <Stack.Screen name="Auth" component={LoginScreen} />
      ) : (
        // Se ESTIVER logado, mostra o fluxo correto
        <>
          {user.tipo_usuario === 'cliente' && (
            <Stack.Screen name="ClientApp" component={ClientNavigator} />
          )}
          {user.tipo_usuario === 'lojista' && (
            <Stack.Screen name="StoreApp" component={StoreNavigator} />
          )}
          {/* Adicione aqui outros tipos de usuário, como 'entregador' */}
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

