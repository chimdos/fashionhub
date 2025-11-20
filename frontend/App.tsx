import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Importa os nossos provedores de contexto
import { AuthProvider } from './src/contexts/AuthContext';
import { BagProvider } from './src/contexts/BagContext';

// Importa o nosso navegador principal
import { AppNavigator } from './src/navigation/AppNavigator';

// --- ALTERAÇÃO PRINCIPAL AQUI ---
// Importa o interceptor da API.
// Isto "ativa" o interceptor em toda a aplicação, 
// fazendo com que ele ouça todas as respostas da API.
import './src/services/apiInterceptor'; 

/**
 * Este é o componente raiz que envolve toda a aplicação.
 */
export default function App() {
  return (
    // O AuthProvider é a camada mais externa
    <AuthProvider>
      {/* O BagProvider envolve a navegação */}
      <BagProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </NavigationContainer>
      </BagProvider>
    </AuthProvider>
  );
}