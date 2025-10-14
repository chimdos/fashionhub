import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../contexts/AuthContext';

// Importe as suas telas
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { HomeScreen as ClientHomeScreen } from '../screens/Cliente/HomeScreen';
import { DashboardScreen as StoreDashboardScreen } from '../screens/Lojista/DashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Navegador para o fluxo do Cliente ---
function ClientNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={ClientHomeScreen} />
      {/* Adicione outras abas para o cliente aqui, como 'Perfil', 'Minhas Malas', etc. */}
    </Tab.Navigator>
  );
}

// --- Navegador para o fluxo do Lojista ---
function StoreNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={StoreDashboardScreen} />
      {/* Adicione outras abas para o lojista aqui, como 'Produtos', 'Pedidos', etc. */}
    </Tab.Navigator>
  );
}

// --- Componente principal que decide qual fluxo mostrar ---
export const AppNavigator = () => {
  const { user, token, isLoading } = useContext(AuthContext);

  // 1. Mostra um indicador de carregamento enquanto verifica o estado de login
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // 2. Se não houver token/usuário, mostra o fluxo de autenticação (tela de login)
  if (!token || !user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* Pode adicionar uma tela de 'Registo' aqui também */}
      </Stack.Navigator>
    );
  }

  // 3. Se o usuário estiver logado, mostra o navegador correto com base no seu tipo
  switch (user.tipo_usuario) {
    case 'cliente':
      return <ClientNavigator />;
    case 'lojista':
      return <StoreNavigator />;
    // case 'entregador': // Adicione o caso para o entregador quando criar o navegador dele
    //   return <DeliveryNavigator />;
    default:
      // Se o tipo de usuário for desconhecido, por segurança, volta para o login
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      );
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

