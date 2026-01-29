import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import axios from 'axios';
import Toast from 'react-native-toast-message';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');

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
      } catch (e) {
        console.error("Erro ao buscar CEP", e);
      }
    }
  };

  const handleUpdate = async () => {
    if (!nome || !email) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Nome e E-mail são obrigatórios.' });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        nome,
        email,
        endereco: { cep, rua, numero, bairro, cidade, estado },
      };

      await api.put(`/api/users/${user?.id}`, payload);
      await updateUser({ ...user!, nome, email });

      Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Perfil atualizado com sucesso!' });
      navigation.goBack();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Não foi possível atualizar o perfil.";
      console.error("Erro ao atualizar:", error.response?.data || error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível atualizar o perfil.' });
    } finally {
      setIsLoading(false);
    }
  };

  const InputGroup = ({ icon, label, value, onChangeText, ...props }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={icon} size={20} color="#ADB5BD" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#ADB5BD"
          {...props}
        />
      </View>
    </View>
  );

  useEffect(() => {
    const loadFullUserData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/users/me`);
        const fullUser = response.data;

        setNome(fullUser.nome);
        setEmail(fullUser.email);

        if (fullUser.endereco) {
          const addr = fullUser.endereco;
          setCep(addr.cep || '');
          setRua(addr.rua || '');
          setNumero(addr.numero || '');
          setBairro(addr.bairro || '');
          setCidade(addr.cidade || '');
          setEstado(addr.estado || '');
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível carregar seus dados de endereço.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadFullUserData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DADOS PESSOAIS</Text>
          <InputGroup icon="person-outline" label="Nome Completo" value={nome} onChangeText={setNome} />
          <InputGroup icon="mail-outline" label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ENDEREÇO DE ENTREGA</Text>
          <InputGroup icon="map-outline" label="CEP" value={cep} onChangeText={handleCepChange} keyboardType="numeric" maxLength={8} />
          <InputGroup icon="business-outline" label="Rua" value={rua} onChangeText={setRua} />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <InputGroup icon="home-outline" label="Nº" value={numero} onChangeText={setNumero} />
            </View>
            <View style={{ flex: 2 }}>
              <InputGroup icon="location-outline" label="Bairro" value={bairro} onChangeText={setBairro} />
            </View>
          </View>

          <InputGroup icon="navigate-outline" label="Cidade" value={cidade} editable={false} />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>SALVAR ALTERAÇÕES</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF'
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },

  content: { padding: 20 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#ADB5BD', marginBottom: 15, letterSpacing: 1 },

  inputContainer: { marginBottom: 15 },
  inputLabel: { fontSize: 13, color: '#6C757D', marginBottom: 8, marginLeft: 4, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 14, paddingHorizontal: 15, height: 55,
    borderWidth: 1, borderColor: '#EEE'
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: '#333' },

  row: { flexDirection: 'row' },

  saveButton: {
    backgroundColor: '#5DADE2', height: 60, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    shadowColor: '#5DADE2', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});