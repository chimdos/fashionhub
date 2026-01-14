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
import axios from 'axios';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';

const Step1 = ({
  nome, setNome, email, setEmail, senha, setSenha, nomeLoja, setNomeLoja, ddi, setDdi, telefone, setTelefone, onNext, isLoading
}: any) => (
  <>
    <Text style={styles.title}>Seja um Lojista</Text>
    <Text style={styles.subtitle}>Etapa 1: Dados básicos</Text>

    <TextInput style={styles.input} placeholder="Nome do responsável" value={nome} onChangeText={setNome} />
    <TextInput style={styles.input} placeholder="E-mail de contato" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
    <TextInput style={styles.input} placeholder="Nome da sua Loja" value={nomeLoja} onChangeText={setNomeLoja} />

    <TextInput style={[styles.input, { marginBottom: 4 }]} placeholder="Crie uma senha" secureTextEntry value={senha} onChangeText={setSenha} />
    <Text style={styles.helperText}>Mínimo de 8 caracteres.</Text>

    <View style={styles.phoneRow}>
      <TextInput style={[styles.input, styles.ddiInput]} value={ddi} onChangeText={setDdi} keyboardType="phone-pad" maxLength={4} />
      <TextInput style={[styles.input, styles.phoneNumberInput]} placeholder="(00) 00000-0000" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
    </View>

    <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={onNext} disabled={isLoading}>
      {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Próximo Passo</Text>}
    </TouchableOpacity>
  </>
);

const Step2 = ({
  cnpj, setCnpj, cep, setCep, rua, setRua, numero, setNumero,
  bairro, setBairro, cidade, setCidade, estado, setEstado,
  onRegister, isLoading
}: any) => {
  const handleCepChange = async (text: string) => {
    setCep(text);
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length === 8) {
      try {
        const res = await axios.get(`https://viacep.com.br/ws/${cleaned}/json/`);
        if (!res.data.erro) {
          setRua(res.data.logradouro);
          setBairro(res.data.bairro);
          setCidade(res.data.localidade);
          setEstado(res.data.uf);
        }
      } catch (e) { console.error(e); }
    }
  };

  return (
    <>
      <Text style={styles.title}>Endereço da Loja</Text>
      <Text style={styles.subtitle}>Etapa 2: Localização e CNPJ</Text>

      <TextInput style={styles.input} placeholder="CNPJ da Empresa" keyboardType="numeric" value={cnpj} onChangeText={setCnpj} />
      <TextInput style={styles.input} placeholder="CEP" keyboardType="numeric" maxLength={8} value={cep} onChangeText={handleCepChange} />
      <TextInput style={styles.input} placeholder="Rua / Avenida" value={rua} onChangeText={setRua} />
      <TextInput style={styles.input} placeholder="Número" keyboardType="numeric" value={numero} onChangeText={setNumero} />
      <TextInput style={styles.input} placeholder="Bairro" value={bairro} onChangeText={setBairro} />
      <TextInput style={[styles.input, styles.disabledInput]} placeholder="Cidade" value={cidade} editable={false} />
      <TextInput style={[styles.input, styles.disabledInput]} placeholder="Estado" value={estado} editable={false} />

      <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={onRegister} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Finalizar Cadastro</Text>}
      </TouchableOpacity>
    </>
  );
};

export const StoreRegisterScreen = ({ navigation }: any) => {
  const { signIn } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [nomeLoja, setNomeLoja] = useState('');
  const [senha, setSenha] = useState('');
  const [ddi, setDdi] = useState('+55');
  const [telefone, setTelefone] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  const handleNextStep = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!nome || !email || !senha || !telefone || !nomeLoja) {
      return Alert.alert('Erro', 'Por favor, preencha todos os campos.');
    }
    if (!emailRegex.test(email)) return Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
    if (senha.length < 8) return Alert.alert('Erro', 'A senha deve ter no mínimo 8 caracteres.');

    setIsLoading(true);
    try {
      const telFormatado = `${ddi}${telefone.replace(/\D/g, '')}`;
      await api.post('/api/auth/check-availability', {
        email,
        telefone: telFormatado,
        nome_loja: nomeLoja
      });
      setStep(2);
    } catch (error: any) {
      const errs = error.response?.data?.errors;
      Alert.alert('Atenção', errs?.email || errs?.telefone || errs?.nome_loja || 'Erro ao verificar disponibilidade dos dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!cnpj || !cep || !numero) return Alert.alert('Erro', 'Por favor, preencha os dados de endereço e CNPJ.');

    setIsLoading(true);
    try {
      const payload = {
        nome, email, senha, tipo_usuario: 'lojista',
        telefone: `${ddi}${telefone.replace(/\D/g, '')}`,
        nome_loja: nomeLoja,
        cnpj,
        endereco: { rua, numero, bairro, cidade, estado, cep }
      };

      const response = await api.post('/api/auth/register', payload);
      await signIn(response.data.user, response.data.token);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha no cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {step === 1 ? (
          <Step1 {...{ nome, setNome, email, setEmail, senha, setSenha, nomeLoja, setNomeLoja, ddi, setDdi, telefone, setTelefone, isLoading }} onNext={handleNextStep} />
        ) : (
          <Step2 {...{ cnpj, setCnpj, cep, setCep, rua, setRua, numero, setNumero, bairro, setBairro, cidade, setCidade, estado, setEstado, isLoading }} onRegister={handleRegister} />
        )}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Voltar ao Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitle: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 30 },
  input: { height: 50, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#ddd' },
  helperText: { fontSize: 12, color: '#777', marginBottom: 12, fontStyle: 'italic' },
  phoneRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ddiInput: { width: '20%', textAlign: 'center' },
  phoneNumberInput: { width: '78%' },
  button: { height: 50, backgroundColor: '#28a745', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#a3d9b1' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#007bff', textAlign: 'center', marginTop: 20 },
  disabledInput: { backgroundColor: '#eee', color: '#666' }
});