import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
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
      <Text style={styles.title}>Menu</Text>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user?.nome}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate('BecomeCourier')}
      >
        <View style={styles.iconContainer}>
          <Text>🏍️</Text>
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>Trabalhe Conosco</Text>
          <Text style={styles.optionSubtitle}>Vire um entregador FashionHub</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
      <Button title="Sair (Logout)" onPress={handleLogout} color="#dc3545" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
  userInfo: { alignItems: 'center', marginBottom: 40 },
  userName: { fontSize: 20, fontWeight: '600' },
  userEmail: { fontSize: 16, color: 'gray', marginTop: 5 },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
  },
});
