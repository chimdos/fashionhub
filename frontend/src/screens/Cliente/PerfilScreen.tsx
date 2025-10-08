import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// A palavra 'export' antes de 'const' é a correção.
// Isso torna o componente HomeScreen "importável".
export const PerfilScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela Inicial do Cliente</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});