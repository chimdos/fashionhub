import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

/**
 * Este é o componente raiz que envolve toda a aplicação.
 * É o ÚNICO lugar onde o NavigationContainer deve estar.
 */
export default function App() {
  return (
    // O AuthProvider gere o estado de login
    <AuthProvider>
      {/* O NavigationContainer gere toda a navegação */}
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

