import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext'; // Importa o contexto

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para o loading
  const { signIn } = useContext(AuthContext); // Pega a função signIn do contexto

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    setIsLoading(true); // Inicia o loading

    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, user } = response.data;
      // Chama a função signIn do contexto para atualizar o estado global
      // A navegação será tratada automaticamente pelo AppNavigator
      await signIn(user, token);
    } catch (error: any) {
      console.error('Erro no login:', error.response?.data || error.message);
      Alert.alert('Erro no Login', error.response?.data?.message || 'Não foi possível entrar. Verifique suas credenciais.');
    } finally {
      setIsLoading(false); // Termina o loading, independentemente do resultado
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FashionHub</Text>
      <Text style={styles.subtitle}>Bem-vindo de volta!</Text>

      <TextInput
        style={styles.input}
        placeholder="Seu e-mail"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Sua senha"
        placeholderTextColor="#999"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading} // Desabilita o botão durante o loading
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Estilos para a tela de login
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

