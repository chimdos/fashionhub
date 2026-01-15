import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, SafeAreaView, Animated } from 'react-native';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

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

export const ResetPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!email || !token || !novaSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (novaSenha !== novaSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    if (novaSenha.length < 8) {
      Alert.alert('Atenção', 'A nova senha precisa ter no mínimo 8 caracteres.');
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
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.logoText}>FashionHub</Text>
            <Text style={styles.title}>Nova senha</Text>
            <Text style={styles.subtitle}>
              Insira o código enviado ao seu e-mail e escolha uma nova senha segura.
            </Text>

            <FloatingInput
              label="Código de verificação"
              value={token}
              onChangeText={setToken}
              keyboardType="number-pad"
            />

            <FloatingInput
              label="Nova senha"
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry
            />

            <FloatingInput
              label="Confirmar nova senha"
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry
            />

            <View style={styles.buttonContainer}>
              <View style={styles.blueLightWrapper}>
                <View style={styles.blueDarkWrapper}>
                  <TouchableOpacity
                    style={styles.buttonBlue}
                    onPress={handleReset}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#333" />
                    ) : (
                      <Text style={styles.buttonTextBlue}>REDEFINIR SENHA</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBFCFD' },
  container: { flexGrow: 1, paddingHorizontal: 25, paddingBottom: 40 },
  content: { width: '100%' },

  backButton: { marginTop: 20, marginLeft: 15, width: 40, height: 40, justifyContent: 'center' },
  logoText: { fontSize: 28, fontWeight: '900', color: '#5DADE2', marginTop: 20, textAlign: 'left' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginTop: 5, textAlign: 'left' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 45, textAlign: 'left', lineHeight: 22 },

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

  buttonContainer: { width: '100%', marginTop: 20 },
  blueLightWrapper: { borderRadius: 25, shadowColor: "#FFF", shadowOffset: { width: -4, height: -4 }, shadowOpacity: 0.8, shadowRadius: 8 },
  blueDarkWrapper: { borderRadius: 25, shadowColor: "#4A9BCE", shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  buttonBlue: { backgroundColor: '#5DADE2', height: 55, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  buttonTextBlue: { color: '#333', fontWeight: 'bold', fontSize: 18 },
});