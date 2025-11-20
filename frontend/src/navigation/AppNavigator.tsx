import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../contexts/AuthContext';

// Importa os NAVEGADORES de cada perfil
import { ClientNavigator } from './ClientNavigator';
import { StoreNavigator } from './StoreNavigator'; // 1. Importa o novo navegador do Lojista

// Importa as telas individuais
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { StoreRegisterScreen } from '../screens/Auth/StoreRegisterScreen';
// Telas que podem ser abertas por cima das abas (ex: Detalhes do Produto)
import { ProductDetailScreen } from '../screens/client/ProductDetailScreen';

const Stack = createNativeStackNavigator();

/**
 * Cria um "Navegador de Pilha" exclusivamente para o fluxo de autenticação.
 */
function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Register" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="StoreRegister" component={StoreRegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

/**
 * Este é o componente "porteiro" principal da aplicação.
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
        // Se NÃO estiver logado, mostra o fluxo completo de autenticação
        <Stack.Screen name="AuthFlow" component={AuthNavigator} />
      ) : (
        // Se ESTIVER logado, mostra o fluxo principal da aplicação
        <>
          {user.tipo_usuario === 'cliente' && (
            <>
              {/* O ClientNavigator (com as abas) é a tela principal */}
              <Stack.Screen name="ClientApp" component={ClientNavigator} />
              {/* Telas que podem ser abertas por cima das abas do cliente */}
              <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            </>
          )}
          {user.tipo_usuario === 'lojista' && (
            // --- ALTERAÇÃO PRINCIPAL AQUI ---
            // 2. Se o usuário for um lojista, carrega o StoreNavigator (com as abas)
            <Stack.Screen name="StoreApp" component={StoreNavigator} />
            // No futuro, podemos adicionar telas Stack aqui também se o lojista precisar
            // (ex: um tela de "Detalhes da Requisição")
          )}
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