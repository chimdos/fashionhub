import React, { useState, useRef, useContext, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const FloatingInput = ({ label, value, onChangeText, secureTextEntry, ...props }: any) => {
  const [isFocused, setIsFocused] = useState(false);

  const isFloating = isFocused || (value && value.length > 0);

  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();

    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: (isFocused || value) ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();
  }, [isFocused, value]);

  const labelTop = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -12],
  });

  const labelFontSize = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  const labelBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#FBFCFD'],
  })

  return (
    <View style={styles.inputShadowWrapper}>
      <Animated.Text
        style={[
          styles.label,
          {
            top: labelTop,
            fontSize: labelFontSize,
            backgroundColor: labelBackgroundColor,
            color: isFocused ? '#5DADE2' : '#333',
            fontWeight: isFocused || value ? 'bold' : 'normal',
          },
        ]}
      >
        {label}
      </Animated.Text>
      <TextInput
        {...props}
        style={styles.neumorphicInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        placeholder=""
      />

      {secureTextEntry && (
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Ionicons
            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const Step1 = ({ nome, setNome, email, setEmail, senha, setSenha, ddi, setDdi, telefone, setTelefone, onNext, isLoading, navigation }: any) => {
  return (
    <View style={styles.content}>
      <Text style={styles.logoText}>FashionHub</Text>
      <Text style={styles.title}>Crie sua conta</Text>

      <FloatingInput label="Nome completo" value={nome} onChangeText={setNome} />

      <FloatingInput
        label="Digite seu email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View>
        <FloatingInput
          label="Crie uma senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
        <Text style={styles.helperText}>Mínimo de 8 caracteres.</Text>
      </View>

      <View style={styles.phoneRow}>
        <View style={{ width: '22%' }}>
          <FloatingInput label="+55" value={ddi} onChangeText={setDdi} keyboardType="phone-pad" maxLength={4} />
        </View>
        <View style={{ width: '75%' }}>
          <FloatingInput label="(00) 00000-0000" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
        </View>
      </View>

      <View style={styles.buttonRow}>
        <View style={[styles.grayLightWrapper, styles.halfButton]}>
          <View style={styles.grayDarkWrapper}>
            <TouchableOpacity style={styles.buttonGray} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonTextGray}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.blueLightWrapper, styles.halfButton]}>
          <View style={styles.blueDarkWrapper}>
            <TouchableOpacity style={styles.buttonBlue} onPress={onNext} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#333" /> : <Text style={styles.buttonTextBlue}>Avançar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const Step2 = ({ rua, setRua, numero, setNumero, bairro, setBairro, cidade, setCidade, estado, setEstado, cep, setCep, onRegister, isLoading, setStep }: any) => {

  const handleCepChange = async (text: string) => {
    setCep(text);
    const cleanedCep = text.replace(/\D/g, '');
    if (cleanedCep.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cleanedCep}/json/`);
        if (!response.data.erro) {
          setRua(response.data.logradouro);
          setBairro(response.data.bairro);
          setCidade(response.data.localidade);
          setEstado(response.data.uf);
        } else {
          Toast.show({
            type: 'info',
            text1: 'CEP não encontrado',
            text2: 'Verifique os números e tente novamente.'
          });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      }
    }
  };

  return (
    <View style={styles.content}>
      <Text style={styles.logoText}>FashionHub</Text>
      <Text style={styles.title2}>Endereço de Entrega</Text>
      <Text style={styles.subtitle}>Onde você receberá suas compras.</Text>

      <View style={styles.inputShadowWrapper}>
        <TextInput style={styles.neumorphicInput} placeholder="CEP" keyboardType="numeric" maxLength={8} value={cep} onChangeText={handleCepChange} />
      </View>
      <View style={styles.inputShadowWrapper}>
        <TextInput style={styles.neumorphicInput} placeholder="Rua / Avenida" value={rua} onChangeText={setRua} />
      </View>

      <View style={styles.phoneRow}>
        <View style={[styles.inputShadowWrapper, { width: '30%' }]}>
          <TextInput style={styles.neumorphicInput} placeholder="Nº" keyboardType="numeric" value={numero} onChangeText={setNumero} />
        </View>
        <View style={[styles.inputShadowWrapper, { width: '67%' }]}>
          <TextInput style={styles.neumorphicInput} placeholder="Bairro" value={bairro} onChangeText={setBairro} />
        </View>
      </View>

      <View style={[styles.inputShadowWrapper, styles.disabledWrapper]}>
        <TextInput style={[styles.neumorphicInput, styles.disabledInput]} placeholder="Cidade" value={cidade} editable={false} />
      </View>

      <View style={styles.buttonRow}>
        <View style={[styles.grayLightWrapper, styles.halfButton]}>
          <View style={styles.grayDarkWrapper}>
            <TouchableOpacity style={styles.buttonGray} onPress={() => setStep(1)}>
              <Text style={styles.buttonTextGray}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.blueLightWrapper, styles.halfButton]}>
          <View style={styles.blueDarkWrapper}>
            <TouchableOpacity style={styles.buttonBlue} onPress={onRegister} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#333" /> : <Text style={styles.buttonTextBlue}>Finalizar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export const RegisterScreen = ({ navigation }: any) => {
  const { signIn } = useContext(AuthContext);
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [ddi, setDdi] = useState('+55');
  const [telefone, setTelefone] = useState('');

  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');

  const handleNextStep = async () => {
    if (!nome || !email || !senha || !telefone) {
      Toast.show({
        type: 'info',
        text1: 'Campos incompletos',
        text2: 'Por favor, preencha todos os dados pessoais.'
      });
      return;
    }

    if (senha.length < 8) {
      Toast.show({
        type: 'info',
        text1: 'Senha fraca',
        text2: 'Use pelo menos 8 caracteres para sua segurança.'
      });
      return;
    }

    setIsLoading(true);

    try {
      const telefoneFormatado = `${ddi}${telefone.replace(/\D/g, '')}`;

      await api.post('api/auth/check-availability', {
        email,
        telefone: telefoneFormatado
      });
      setStep(2);
    } catch (error: any) {
      const serverErrors = error.response?.data?.errors;

      if (serverErrors) {
        const msg = serverErrors.email || serverErrors.telefone;
        Toast.show({
          type: 'error',
          text1: 'Dados já em uso',
          text2: serverErrors.email || serverErrors.telefone
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro de conexão',
          text2: 'Não foi possível verificar seus dados agora.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!rua || !numero || !bairro || !cidade || !estado || !cep) {
      Toast.show({
        type: 'info',
        text1: 'Endereço incompleto',
        text2: 'Preencha todos os campos para a entrega. 📍'
      });
      return;
    }

    if (senha.length < 8) {
      Toast.show({
        type: 'info',
        text1: 'Senha fraca',
        text2: 'Use pelo menos 8 caracteres para sua segurança.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const telefoneFormatado = `${ddi}${telefone.replace(/\D/g, '')}`;

      const payload = {
        nome,
        email,
        senha,
        tipo_usuario: 'cliente',
        telefone: telefoneFormatado,
        endereco: { rua, numero, bairro, cidade, estado, cep }
      };

      const response = await api.post('/api/auth/register', payload);
      const { token, user } = response.data;
      await signIn(user, token);
    } catch (error: any) {
      console.error('Erro no registro:', error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Falha no cadastro',
        text2: error.response?.data?.message || 'Tente novamente em instantes.'
      });
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {step === 1 ? (
          <Step1 {...{ navigation, isLoading, nome, setNome, email, setEmail, senha, setSenha, ddi, setDdi, telefone, setTelefone }} onNext={handleNextStep} />
        ) : (
          <Step2 {...{ rua, setRua, numero, setNumero, bairro, setBairro, cidade, setCidade, estado, setEstado, cep, setCep, isLoading, setStep }} onRegister={handleRegister} />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Já possui uma conta? Faça login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('StoreRegister')}>
          <Text style={styles.linkText}>É um lojista? Cadastre sua loja aqui</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBFCFD',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  content: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#5DADE2',
    marginTop: 40,
    marginBottom: 10,
    textAlign: 'left',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 5,
    marginBottom: 40,
    textAlign: 'left',
  },
  title2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'left',
  },

  inputShadowWrapper: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
    justifyContent: 'center',
  },
  neumorphicInput: {
    height: 55,
    paddingHorizontal: 15,
    paddingRight: 50,
    fontSize: 16,
    color: '#333333',
    borderRadius: 18,
  },
  input: {
    width: '100%',
    height: 55,
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  disabledInput: {
    backgroundColor: '#E9ECEF',
    color: '#6C757D',
  },
  helperText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 15,
    marginTop: -20,
    marginBottom: 15,
  },

  phoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 30,
  },
  halfButton: {
    width: '48%',
  },

  button: {
    width: '100%',
    height: 55,
    backgroundColor: '#5DADE2',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A5D1EB',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  blueLightWrapper: {
    borderRadius: 25,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  blueDarkWrapper: {
    borderRadius: 25,
    shadowColor: "#4A9BCE",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonBlue: {
    backgroundColor: '#5DADE2',
    height: 55,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextBlue: { color: '#333333', fontWeight: 'bold', fontSize: 18 },

  grayLightWrapper: {
    borderRadius: 25,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: -5, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  grayDarkWrapper: {
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonGray: {
    backgroundColor: '#F0F0F0',
    height: 55,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  buttonTextGray: { color: '#333333', fontWeight: 'bold', fontSize: 18 },

  linkText: {
    color: '#5DADE2',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },

  disabledWrapper: { backgroundColor: '#E9ECEF' },

  label: {
    position: 'absolute',
    left: 15,
    color: '#444',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    zIndex: 2,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  labelIdle: {
    top: 16,
    fontSize: 16,
  },
  labelFloating: {
    top: -10,
    left: 15,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5DADE2',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

});