import React, { useState, useContext, useRef, useEffect } from 'react';
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
  Image,
} from 'react-native';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';

const FloatingInput = ({ label, value, onChangeText, secureTextEntry, ...props }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
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
  });

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
      <View style={styles.inputContainer}>
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
    </View>
  );
};

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha o e-mail e a senha.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, senha });
      const { token, user } = response.data;
      await signIn(user, token);
    } catch (error: any) {
      console.error('Erro no login:', error.response?.data || error.message);
      Alert.alert('Erro no Login', error.response?.data?.message || 'E-mail ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.logoText}>FashionHub</Text>
            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>Acesse sua conta para continuar.</Text>

            <FloatingInput
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FloatingInput
              label="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <View style={styles.blueLightWrapper}>
                <View style={styles.blueDarkWrapper}>
                  <TouchableOpacity
                    style={styles.buttonBlue}
                    onPress={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#333" />
                    ) : (
                      <Text style={styles.buttonTextBlue}>ENTRAR</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.socialContainer}>
              <Text style={styles.socialTitle}>Ou acesse com</Text>
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialIcon}>
                  <Image source={require('../../assets/google_g.png')} style={styles.googleImage} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon}>
                  <Ionicons name="logo-apple" size={30} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Não possui uma conta? <Text style={{ fontWeight: 'bold' }}>Cadastre-se</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBFCFD' },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 20 },
  content: { width: '100%' },

  logoText: { fontSize: 28, fontWeight: '900', color: '#5DADE2', marginTop: 40, textAlign: 'left' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 5, textAlign: 'left' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 40, textAlign: 'left' },

  inputShadowWrapper: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainer: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  neumorphicInput: { flex: 1, height: 55, paddingHorizontal: 15, fontSize: 16, color: '#333', borderRadius: 18 },
  label: { position: 'absolute', left: 15, paddingHorizontal: 5, zIndex: 2 },
  eyeIcon: { position: 'absolute', right: 15, height: '100%', justifyContent: 'center' },

  forgotPasswordContainer: { alignSelf: 'flex-end', marginBottom: 30, marginTop: -10 },
  forgotPasswordText: { color: '#5DADE2', fontSize: 14, fontWeight: '600' },

  buttonContainer: { width: '100%', marginTop: 10 },
  blueLightWrapper: { borderRadius: 25, shadowColor: "#FFF", shadowOffset: { width: -4, height: -4 }, shadowOpacity: 0.8, shadowRadius: 8 },
  blueDarkWrapper: { borderRadius: 25, shadowColor: "#4A9BCE", shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  buttonBlue: { backgroundColor: '#5DADE2', height: 55, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  buttonTextBlue: { color: '#333', fontWeight: 'bold', fontSize: 18 },

  socialContainer: { alignItems: 'center', marginTop: 40 },
  socialTitle: { fontSize: 14, color: '#888', marginBottom: 15, fontWeight: '600' },
  socialRow: { flexDirection: 'row', gap: 25 },
  socialIcon: {
    backgroundColor: '#FFFFFF',
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  googleImage: { width: 28, height: 28, resizeMode: 'contain' },

  footer: { paddingVertical: 20, backgroundColor: '#FBFCFD', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  linkText: { color: '#333', fontSize: 14 },
});