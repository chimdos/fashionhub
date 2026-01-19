import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import axios from 'axios';

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

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      Alert.alert("Erro", "Nome e E-mail são obrigatórios.");
      return;
    }

    if (novaSenha && novaSenha !== confirmarSenha) {
      Alert.alert("Erro", "A nova senha e a confirmação não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        nome,
        email,
        endereco: {
          cep,
          rua,
          numero,
          bairro,
          cidade,
          estado
        },
        senha_atual: senhaAtual,
        nova_senha: novaSenha
      };

      const response = await api.put(`/api/users/${user?.id}`, payload);

      const updatedUserData = {
        ...user!,
        nome: nome,
        email: email,
      };

      await updateUser(updatedUserData);

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      navigation.goBack();

    } catch (error: any) {
      const msg = error.response?.data?.message || "Não foi possível atualizar o perfil.";
      console.error("Erro ao atualizar:", error.response?.data || error);
      Alert.alert("Erro", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomInput = ({ label, value, onChangeText, placeholder, ...props }: any) => (
    <View style={styles.inputSection}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputLightWrapper}>
        <View style={styles.inputDarkWrapper}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#AAA"
            {...props}
          />
        </View>
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
        Alert.alert("Erro", "Não foi possível carregar seus dados de endereço.");
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
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Dados Pessoais</Text>
        <CustomInput label="Nome" value={nome} onChangeText={setNome} />
        <CustomInput label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
        <CustomInput label="CEP" value={cep} onChangeText={handleCepChange} keyboardType="numeric" maxLength={8} />
        <CustomInput label="Rua" value={rua} onChangeText={setRua} />
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <CustomInput label="Número" value={numero} onChangeText={setNumero} />
          </View>
          <View style={{ flex: 2 }}>
            <CustomInput label="Bairro" value={bairro} onChangeText={setBairro} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 2, marginRight: 10 }}>
            <CustomInput label="Cidade" value={cidade} onChangeText={setCidade} editable={false} />
          </View>
          <View style={{ flex: 1 }}>
            <CustomInput label="UF" value={estado} onChangeText={setEstado} editable={false} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Segurança</Text>
        <CustomInput
          label="Senha Atual"
          value={senhaAtual}
          onChangeText={setSenhaAtual}
          secureTextEntry={!showPassword}
          placeholder="Digite para autorizar mudanças"
        />
        <CustomInput
          label="Nova Senha"
          value={novaSenha}
          onChangeText={setNovaSenha}
          secureTextEntry={!showPassword}
          placeholder="Mínimo 8 caracteres"
        />
        <CustomInput
          label="Confirmar Nova Senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry={!showPassword}
        />

        <View style={styles.buttonContainer}>
          <View style={styles.btnLightWrapper}>
            <View style={styles.btnDarkWrapper}>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#333" /> : <Text style={styles.saveButtonText}>SALVAR TUDO</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBFCFD'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333'
  },
  backButton: {
    width: 45,
    height: 45,
    backgroundColor: '#FFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 25,
    paddingBottom: 60
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5DADE2',
    marginTop: 30,
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  inputSection: {
    marginBottom: 18
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
    marginLeft: 5
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  inputLightWrapper: {
    borderRadius: 15,
    shadowColor: "#FFF",
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  inputDarkWrapper: {
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 52,
    color: '#333',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#F8F9FA',
  },

  disabledInput: {
    backgroundColor: '#F1F1F1',
    color: '#999',
  },

  buttonContainer: {
    marginTop: 40
  },
  btnLightWrapper: {
    borderRadius: 25,
    shadowColor: "#FFF",
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  btnDarkWrapper: {
    borderRadius: 25,
    shadowColor: "#4A9BCE",
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButton: {
    backgroundColor: '#5DADE2',
    height: 60,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5
  },
});