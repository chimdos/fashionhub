import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';

export const StoreRegisterScreen = ({ navigation }: any) => {
  const { signIn } = useContext(AuthContext);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [formattedTelefone, setFormattedTelefone] = useState('');
  const [nomeLoja, setNomeLoja] = useState(''); // Campo específico do lojista
  const [isLoading, setIsLoading] = useState(false);
  const phoneInput = React.useRef<PhoneInput>(null);

  const handleRegister = async () => {
    // Validação básica dos campos
    if (!nome || !email || !senha || !telefone || !nomeLoja) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        nome,
        email,
        senha,
        tipo_usuario: 'lojista', // Define o tipo como lojista
        telefone: formattedTelefone,
        nome_loja: nomeLoja // Envia o nome da loja para o backend
      };

      const response = await api.post('/api/auth/register', payload);
      const { token, user } = response.data;
      await signIn(user, token); // Faz o login automaticamente

    } catch (error: any) {
      console.error('Erro no registro do lojista:', error.response?.data || error.message);
      Alert.alert('Erro no Registro', error.response?.data?.message || 'Não foi possível criar a conta de lojista.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Cadastro de Lojista</Text>
        <Text style={styles.subtitle}>Informe os dados da sua loja.</Text>
        <TextInput style={styles.input} placeholder="Nome do responsável" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="E-mail de contato" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Nome da Loja" value={nomeLoja} onChangeText={setNomeLoja} />
        <TextInput style={styles.input} placeholder="Crie uma senha" secureTextEntry value={senha} onChangeText={setSenha} />
        <PhoneInput
          ref={phoneInput}
          defaultValue={telefone}
          defaultCode="BR"
          layout="first"
          onChangeText={(text) => setTelefone(text)}
          onChangeFormattedText={(text) => setFormattedTelefone(text)}
          containerStyle={styles.phoneContainer}
          textInputStyle={styles.phoneInput}
          withShadow
        />
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar Conta de Lojista</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Já possui uma conta? Faça login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>É um cliente? Cadastre-se aqui</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos semelhantes aos da tela de registro do cliente
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 30 },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  phoneContainer: { width: '100%', marginBottom: 12 },
  phoneInput: { height: 50, backgroundColor: '#fff' },
  button: { width: '100%', height: 50, backgroundColor: '#28a745', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 }, // Cor verde para lojista
  buttonDisabled: { backgroundColor: '#a3d9b1' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#007bff', fontSize: 16, textAlign: 'center', marginTop: 20 },
});
