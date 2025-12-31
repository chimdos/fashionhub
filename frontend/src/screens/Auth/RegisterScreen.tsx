import React, { useState, useRef, useContext } from 'react';
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

// --- Os componentes Step1 e Step2 permanecem exatamente os mesmos ---
const Step1 = ({ nome, setNome, email, setEmail, senha, setSenha, telefone, setTelefone, formattedTelefone, setFormattedTelefone, onNext }: any) => {
  const phoneInput = useRef<PhoneInput>(null);
  return (
    <>
      <Text style={styles.title}>Crie sua Conta</Text>
      <Text style={styles.subtitle}>Vamos começar com seus dados básicos.</Text>
      <TextInput style={styles.input} placeholder="Nome completo" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Seu e-mail" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
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
        autoFocus={false}
      />
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Avançar</Text>
      </TouchableOpacity>
    </>
  );
};
const Step2 = ({ rua, setRua, numero, setNumero, bairro, setBairro, cidade, setCidade, estado, setEstado, cep, setCep, onRegister, isLoading }: any) => {
  return (
    <>
      <Text style={styles.title}>Endereço de Entrega</Text>
      <Text style={styles.subtitle}>Onde você receberá suas malas.</Text>
      <TextInput style={styles.input} placeholder="CEP" keyboardType="numeric" value={cep} onChangeText={setCep} />
      <TextInput style={styles.input} placeholder="Rua / Avenida" value={rua} onChangeText={setRua} />
      <TextInput style={styles.input} placeholder="Número" keyboardType="numeric" value={numero} onChangeText={setNumero} />
      <TextInput style={styles.input} placeholder="Bairro" value={bairro} onChangeText={setBairro} />
      <TextInput style={styles.input} placeholder="Cidade" value={cidade} onChangeText={setCidade} />
      <TextInput style={styles.input} placeholder="Estado (Ex: SP)" autoCapitalize="characters" maxLength={2} value={estado} onChangeText={setEstado} />
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={onRegister}
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar Conta</Text>}
      </TouchableOpacity>
    </>
  );
};

// --- Componente Principal ---
export const RegisterScreen = ({ navigation }: any) => {
  const { signIn } = useContext(AuthContext);
  const [step, setStep] = useState<1 | 2>(1);
  // Estados da Etapa 1
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [formattedTelefone, setFormattedTelefone] = useState('');
  // Estados da Etapa 2
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = () => {
    if (!nome || !email || !senha || !telefone) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos da primeira etapa.');
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    if (!rua || !numero || !bairro || !cidade || !estado || !cep) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos do endereço.');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        nome, email, senha, tipo_usuario: 'cliente', telefone: formattedTelefone,
        endereco: { rua, numero, bairro, cidade, estado, cep }
      };
      const response = await api.post('/api/auth/register', payload);
      const { token, user } = response.data;
      await signIn(user, token);
    } catch (error: any) {
      console.error('Erro no registro:', error.response?.data || error.message);
      Alert.alert('Erro no Registro', error.response?.data?.message || 'Não foi possível criar a conta.');
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {step === 1 ? (
          <Step1
            nome={nome} setNome={setNome}
            email={email} setEmail={setEmail}
            senha={senha} setSenha={setSenha}
            telefone={telefone} setTelefone={setTelefone}
            formattedTelefone={formattedTelefone} setFormattedTelefone={setFormattedTelefone}
            onNext={handleNextStep}
          />
        ) : (
          <Step2
            rua={rua} setRua={setRua}
            numero={numero} setNumero={setNumero}
            bairro={bairro} setBairro={setBairro}
            cidade={cidade} setCidade={setCidade}
            estado={estado} setEstado={setEstado}
            cep={cep} setCep={setCep}
            onRegister={handleRegister}
            isLoading={isLoading}
          />
        )}

        {/* Link para a tela de Login */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Já possui uma conta? Faça login</Text>
        </TouchableOpacity>

        {/* --- ALTERAÇÃO PRINCIPAL AQUI --- */}
        {/* Link para a tela de Registro de Lojista */}
        <TouchableOpacity onPress={() => navigation.navigate('StoreRegister')}>
          <Text style={styles.linkText}>É um lojista? Cadastre sua loja aqui</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Seus estilos permanecem os mesmos
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 30 },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  phoneContainer: { width: '100%', marginBottom: 12 },
  phoneInput: { height: 50, backgroundColor: '#fff' },
  button: { width: '100%', height: 50, backgroundColor: '#007bff', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#a0c7e4' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#007bff', fontSize: 16, textAlign: 'center', marginTop: 20 },
});