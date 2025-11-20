import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, Alert } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';

export const StoreSettingsScreen = () => {
  const { signOut, user } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Você tem certeza que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", onPress: () => signOut(), style: "destructive" }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Minha Conta</Text>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user?.nome}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>
      <Text style={styles.info}>Configurações da loja virão aqui.</Text>
      <Button title="Sair (Logout)" onPress={handleLogout} color="#dc3545" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
  userInfo: { alignItems: 'center', marginBottom: 30 },
  userName: { fontSize: 20, fontWeight: '600' },
  userEmail: { fontSize: 16, color: 'gray', marginTop: 5 },
  info: { fontSize: 16, color: 'gray', marginBottom: 40 },
});