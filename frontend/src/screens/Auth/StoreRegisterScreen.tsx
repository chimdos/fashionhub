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
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';

const formatCNPJ = (value: string) => {
  const cnpj = value.replace(/\D/g, '');
  if (cnpj.length <= 2) return cnpj;
  if (cnpj.length <= 5) return cnpj.replace(/^(\d{2})(\d)/, '$1.$2');
  if (cnpj.length <= 8) return cnpj.replace(/^(\d{2})(\d{3})(\d)/, '$1.$2.$3');
  if (cnpj.length <= 12) return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d)/, '$1.$2.$3/$4');
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
};

const validateCNPJ = (cnpj: string) => {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
};

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <View style={styles.progressContainer}>
    <View style={[styles.progressDot, styles.activeDot]} />
    <View style={[styles.progressLine, currentStep === 2 && styles.activeLine]} />
    <View style={[styles.progressDot, currentStep === 2 && styles.activeDot]} />
  </View>
);

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

  const handleNextStep = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!nome || !email || !senha || !telefone || !nomeLoja) {
      return Alert.alert('Atenção', 'Preencha todos os campos básicos.');
    }
    if (!emailRegex.test(email)) return Alert.alert('Erro', 'E-mail inválido.');
    if (senha.length < 8) return Alert.alert('Erro', 'Senha muito curta.');

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
      Alert.alert('Atenção', errs?.email || errs?.telefone || errs?.nome_loja || 'Erro ao validar dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateCNPJ(cnpj)) return Alert.alert('Erro', 'CNPJ Inválido.');
    if (!cep || !numero || !rua) return Alert.alert('Erro', 'Complete o endereço.');

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <StepIndicator currentStep={step} />
          </View>

          <Text style={styles.title}>{step === 1 ? 'Seja um Lojista' : 'Localização'}</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? 'Crie sua conta profissional para vender.' : 'Onde sua loja está situada?'}
          </Text>

          <View style={styles.formCard}>
            {step === 1 ? (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#28a745" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Nome do Responsável" value={nome} onChangeText={setNome} />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#28a745" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="E-mail de Contato" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="business-outline" size={20} color="#28a745" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Nome da Loja" value={nomeLoja} onChangeText={setNomeLoja} />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#28a745" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Senha (min. 8 caracteres)" secureTextEntry value={senha} onChangeText={setSenha} />
                </View>

                <View style={styles.phoneRow}>
                  <View style={[styles.inputContainer, { width: '25%' }]}>
                    <TextInput style={[styles.input, { textAlign: 'center', paddingLeft: 0 }]} value={ddi} onChangeText={setDdi} keyboardType="phone-pad" maxLength={4} />
                  </View>
                  <View style={[styles.inputContainer, { width: '72%' }]}>
                    <Ionicons name="call-outline" size={20} color="#28a745" style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="(00) 00000-0000" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Próximo Passo</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="card-outline" size={20} color="#28a745" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="CNPJ"
                    keyboardType="numeric"
                    maxLength={18}
                    value={cnpj}
                    onChangeText={(text) => setCnpj(formatCNPJ(text))}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#28a745" style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="CEP" keyboardType="numeric" maxLength={8} value={cep} onChangeText={handleCepChange} />
                </View>

                <TextInput style={styles.inputFieldOnly} placeholder="Rua / Avenida" value={rua} onChangeText={setRua} />

                <View style={styles.phoneRow}>
                  <TextInput style={[styles.inputFieldOnly, { width: '30%' }]} placeholder="Nº" keyboardType="numeric" value={numero} onChangeText={setNumero} />
                  <TextInput style={[styles.inputFieldOnly, { width: '65%' }]} placeholder="Bairro" value={bairro} onChangeText={setBairro} />
                </View>

                <View style={styles.phoneRow}>
                  <TextInput style={[styles.inputFieldOnly, styles.disabledInput, { width: '70%' }]} placeholder="Cidade" value={cidade} editable={false} />
                  <TextInput style={[styles.inputFieldOnly, styles.disabledInput, { width: '25%' }]} placeholder="UF" value={estado} editable={false} />
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Finalizar Cadastro</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
            <Text style={styles.footerText}>Já tem uma loja? <Text style={styles.footerLinkBold}>Faça login</Text></Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContainer: { padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { padding: 8, backgroundColor: '#FFF', borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },

  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#DDD' },
  activeDot: { backgroundColor: '#28a745' },
  progressLine: { width: 30, height: 2, backgroundColor: '#DDD', marginHorizontal: 4 },
  activeLine: { backgroundColor: '#28a745' },

  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 25, lineHeight: 22 },

  formCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },

  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F5', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, height: 55 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#333', fontSize: 16 },

  inputFieldOnly: { backgroundColor: '#F1F3F5', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, height: 55, fontSize: 16, color: '#333' },

  phoneRow: { flexDirection: 'row', justifyContent: 'space-between' },
  disabledInput: { backgroundColor: '#E9ECEF', color: '#ADB5BD' },

  primaryButton: { backgroundColor: '#28a745', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3, shadowColor: '#28a745', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  footerLink: { marginTop: 30, alignItems: 'center' },
  footerText: { color: '#666', fontSize: 15 },
  footerLinkBold: { color: '#28a745', fontWeight: 'bold' }
});