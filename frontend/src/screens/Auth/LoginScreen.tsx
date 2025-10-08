import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

// Mock de função de login para o exemplo
export const LoginScreen = ({ onLogin }: { onLogin: (userType: 'cliente' | 'lojista') => void }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Tela de Login</Text>
    <Button title="Entrar como Cliente" onPress={() => onLogin('cliente')} />
    <Button title="Entrar como Lojista" onPress={() => onLogin('lojista')} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});
