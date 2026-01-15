import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, ScrollView, Animated } from 'react-native';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const FloatingInput = ({ label, value, onChangeText, ...props }: any) => {
  const [isFocused, setIsFocused] = useState(false);
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
      <TextInput
        {...props}
        style={styles.neumorphicInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        onChangeText={onChangeText}
        placeholder=""
      />
    </View>
  );
};

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert('Atenção', 'Por favor, insira seu e-mail.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      Alert.alert(
        'E-mail Enviado',
        'Você receberá um token para redefinir sua senha em instantes.',
        [
          {
            text: 'Digitar Token',
            onPress: () => navigation.navigate('ResetPassword')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao solicitar recuperação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <Text style={styles.logoText}>FashionHub</Text>
            <Text style={styles.title}>Recuperar senha</Text>
            <Text style={styles.subtitle}>
              Digite seu e-mail abaixo. Enviaremos um link com as instruções para criar uma nova senha.
            </Text>

            <FloatingInput
              label="E-mail cadastrado"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.buttonContainer}>
              <View style={styles.blueLightWrapper}>
                <View style={styles.blueDarkWrapper}>
                  <TouchableOpacity
                    style={styles.buttonBlue}
                    onPress={handleRequestReset}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#333" />
                    ) : (
                      <Text style={styles.buttonTextBlue}>ENVIAR TOKEN</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Lembrou a senha? <Text style={{ fontWeight: 'bold' }}>Faça login</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBFCFD' },
  container: { flexGrow: 1, paddingHorizontal: 25, paddingBottom: 20 },
  content: { width: '100%' },

  backButton: {
    marginTop: 20,
    marginLeft: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },

  logoText: { fontSize: 28, fontWeight: '900', color: '#5DADE2', marginTop: 20, textAlign: 'left' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginTop: 5, textAlign: 'left' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 45, textAlign: 'left', lineHeight: 22 },

  inputShadowWrapper: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    marginBottom: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  neumorphicInput: { height: 55, paddingHorizontal: 15, fontSize: 16, color: '#333', borderRadius: 18 },
  label: { position: 'absolute', left: 15, paddingHorizontal: 5, zIndex: 2 },

  buttonContainer: { width: '100%', marginTop: 10 },
  blueLightWrapper: { borderRadius: 25, shadowColor: "#FFF", shadowOffset: { width: -4, height: -4 }, shadowOpacity: 0.8, shadowRadius: 8 },
  blueDarkWrapper: { borderRadius: 25, shadowColor: "#4A9BCE", shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  buttonBlue: { backgroundColor: '#5DADE2', height: 55, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  buttonTextBlue: { color: '#333', fontWeight: 'bold', fontSize: 18 },

  footer: { paddingVertical: 20, backgroundColor: '#FBFCFD', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  linkText: { color: '#333', fontSize: 14 },
});