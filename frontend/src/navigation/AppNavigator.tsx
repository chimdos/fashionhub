import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../contexts/AuthContext';

// Importa os navegadores e telas
import { ClientNavigator } from './ClientNavigator'; // Navegador do Cliente (com abas)
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen'; // Tela de Registro do Cliente
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { StoreRegisterScreen } from '../screens/Auth/StoreRegisterScreen'; // 1. Importa a nova tela de Registro do Lojista
import { StoreDashboardScreen } from '../screens/store/DashboardScreen'; // Tela do Lojista

const Stack = createNativeStackNavigator();

/**
 * --- NOVA ESTRUTURA ---
 * Criamos um "Navegador de Pilha" exclusivamente para o fluxo de autenticação.
 * Ele gerencia todas as telas relacionadas ao login e registro.
 */
function AuthNavigator() {
  return (
    // 'initialRouteName="Register"' define "RegisterScreen" (Cliente) como a primeira tela
    <Stack.Navigator initialRouteName="Register" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Register" component={RegisterScreen} />
      {/* 2. Adiciona a nova tela de Registro do Lojista a este fluxo */}
      <Stack.Screen name="StoreRegister" component={StoreRegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

/**
 * Este é o componente "porteiro" principal da aplicação.
 * Ele decide se mostra o fluxo de autenticação (AuthNavigator)
 * ou o fluxo principal da aplicação (ClientNavigator ou StoreDashboardScreen).
 */
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
        // Se NÃO estiver logado, ele agora carrega o nosso navegador de autenticação completo
        <Stack.Screen name="AuthFlow" component={AuthNavigator} />
      ) : (
        // Se ESTIVER logado, o fluxo principal é carregado
        <>
          {user.tipo_usuario === 'cliente' && (
            <Stack.Screen name="ClientApp" component={ClientNavigator} />
          )}
          {user.tipo_usuario === 'lojista' && (
            <Stack.Screen name="StoreApp" component={StoreDashboardScreen} />
          )}
          {/* Adicione o fluxo para 'entregador' aqui se necessário */}
        </>
      )}
    </Stack.Navigator>
  );
};

// Estilos permanecem os mesmos
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Adicionado um fundo para o loading
  },
});

