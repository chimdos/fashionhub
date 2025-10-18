import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../contexts/AuthContext';

// Importa o NAVEGADOR do cliente, que contém a lógica das abas
import { ClientNavigator } from './ClientNavigator';

// Importa as telas individuais que este navegador principal precisa conhecer
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { ProductDetailScreen } from '../screens/client/ProductDetailScreen';
import { StoreDashboardScreen } from '../screens/store/DashboardScreen'; // Placeholder para o lojista

const Stack = createNativeStackNavigator();

/**
 * Este é o navegador principal da aplicação (o "porteiro").
 * Ele decide se mostra o fluxo de login ou o fluxo principal da aplicação
 * com base no estado de autenticação.
 */
export const AppNavigator = () => {
  // Pega os dados de autenticação do nosso contexto global
  const { user, token, isLoading } = useContext(AuthContext);

  // 1. Mostra uma tela de carregamento enquanto o AuthContext verifica o login
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // 2. O Stack.Navigator é o controlador de nível superior.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token || !user ? (
        // Se NÃO estiver logado, a única tela disponível é a de Autenticação (Login)
        <Stack.Screen name="Auth" component={LoginScreen} />
      ) : (
        // Se ESTIVER logado, mostra o fluxo principal da aplicação
        <>
          {user.tipo_usuario === 'cliente' && (
            <>
              {/* O ClientNavigator (com as abas) é a tela principal do cliente */}
              <Stack.Screen name="ClientApp" component={ClientNavigator} />
              {/* A tela de detalhes é uma "irmã", no mesmo nível, permitindo a navegação direta */}
              <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            </>
          )}
          {user.tipo_usuario === 'lojista' && (
            // Se o usuário for um lojista, carrega a tela principal dele
            <Stack.Screen name="StoreApp" component={StoreDashboardScreen} />
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

