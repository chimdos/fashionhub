import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ExploreScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Explorar</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
  },
});

