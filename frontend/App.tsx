import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Importa os nossos provedores de contexto
import { AuthProvider } from './src/contexts/AuthContext';
import { BagProvider } from './src/contexts/BagContext'; // 1. Importa o BagProvider

// Importa o nosso navegador principal
import { AppNavigator } from './src/navigation/AppNavigator';

/**
 * Este é o componente raiz que envolve toda a aplicação.
 */
export default function App() {
  return (
    // O AuthProvider é a camada mais externa, provendo o login para todos
    <AuthProvider>
      {/* --- ALTERAÇÃO PRINCIPAL AQUI ---
        2. O BagProvider agora envolve a navegação, provendo os dados da mala
           para todas as telas que estão dentro do NavigationContainer.
      */}
      <BagProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </NavigationContainer>
      </BagProvider>
    </AuthProvider>
  );
}

