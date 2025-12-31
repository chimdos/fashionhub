import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React from 'react';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Importa os nossos provedores de contexto
import { AuthProvider } from './src/contexts/AuthContext';
import { BagProvider } from './src/contexts/BagContext';

// Importa o nosso navegador principal
import { AppNavigator } from './src/navigation/AppNavigator';

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
registerRootComponent(App);