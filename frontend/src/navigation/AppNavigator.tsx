import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importe suas telas
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { HomeScreen as ClienteHomeScreen } from '../screens/Cliente/HomeScreen';
import { PerfilScreen as ClientePerfilScreen } from '../screens/Cliente/PerfilScreen';
import { DashboardScreen as LojistaDashboardScreen } from '../screens/Lojista/DashboardScreen';

// --- Tipagem para os navegadores (boa prática com TypeScript) ---
type AuthStackParamList = { Login: undefined };
type ClienteTabParamList = { Home: undefined; Perfil: undefined };
type LojistaTabParamList = { Dashboard: undefined; Produtos: undefined };

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Navegadores específicos para cada tipo de usuário ---

function ClienteNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={ClienteHomeScreen} />
      <Tab.Screen name="Perfil" component={ClientePerfilScreen} />
    </Tab.Navigator>
  );
}

function LojistaNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={LojistaDashboardScreen} />
      {/* Adicione outras telas do lojista aqui */}
    </Tab.Navigator>
  );
}

// --- Componente principal do Navegador ---

export function AppNavigator() {
  // Estado para simular autenticação e tipo de usuário
  const [user, setUser] = useState<{ isLoggedIn: boolean; type: 'cliente' | 'lojista' | null }>({
    isLoggedIn: false,
    type: null,
  });

  const handleLogin = (userType: 'cliente' | 'lojista') => {
    setUser({ isLoggedIn: true, type: userType });
  };

  const handleLogout = () => {
    setUser({ isLoggedIn: false, type: null });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user.isLoggedIn ? (
          // Fluxo de Autenticação (usuário deslogado)
          <Stack.Screen name="Auth" options={{ headerShown: false }}>
            {() => <LoginScreen onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          // Fluxo Principal (usuário logado)
          <Stack.Screen name="App" options={{ headerShown: false }}>
            {() => {
              // Renderiza o navegador correto com base no tipo de usuário
              switch (user.type) {
                case 'cliente':
                  return <ClienteNavigator />;
                case 'lojista':
                  return <LojistaNavigator />;
                // Adicione casos para 'entregador', etc.
                default:
                  // Fallback caso algo dê errado
                  return <LoginScreen onLogin={handleLogin} />;
              }
            }}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
