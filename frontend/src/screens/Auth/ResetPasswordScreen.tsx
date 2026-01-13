import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import api from '../../services/api';

export const ResetPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!email || !token || !novaSenha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/auth/reset-password', { email, token, novaSenha });
      Alert.alert('Sucesso', 'Sua senha foi alterada!', [
        { text: 'Ir para Login', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao redefinir senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Senha</Text>
      <Text style={styles.subtitle}>Insira o código enviado e sua nova senha.</Text>

      <TextInput style={styles.input} placeholder="Confirme seu E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Token de Recuperação" value={token} onChangeText={setToken} />
      <TextInput style={styles.input} placeholder="Nova Senha" value={novaSenha} onChangeText={setNovaSenha} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Redefinir Senha</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#fff', height: 50, borderRadius: 8, paddingHorizontal: 16, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#28a745', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});