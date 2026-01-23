import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export const BecomeCourierScreen = () => {
  const navigation = useNavigation<any>();
  const { updateUser, updateSession } = useAuth();

  const [veiculo, setVeiculo] = useState('');
  const [placa, setPlaca] = useState('');
  const [cnh, setCnh] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!veiculo || !placa || !cnh) {
      Alert.alert('Atenção', 'Por favor, preencha todos os dados do veículo e habilitação.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/api/users/become-courier', {
        veiculo,
        placa: placa.toUpperCase(),
        cnh
      });

      const { user: updatedUser, token: newToken } = response.data;

      if (updatedUser && newToken) {
        await updateSession(updatedUser, newToken);

        Alert.alert(
          'Sucesso!',
          'Agora você é um entregador parceiro!',
          [{ text: 'Começar', onPress: () => { } }]
        );
      }
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao processar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seja um Parceiro</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.infoSection}>
            <View style={styles.iconBadge}>
              <MaterialCommunityIcons name="motorbike" size={40} color="#28a745" />
            </View>
            <Text style={styles.title}>Ganhe com a FashionHub</Text>
            <Text style={styles.subtitle}>
              Entregue malas de roupas em Sorocaba e região com total flexibilidade de horários.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Dados do Veículo</Text>

            <Text style={styles.label}>MODELO DO VEÍCULO</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="motorbike" size={20} color="#ADB5BD" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={veiculo}
                onChangeText={setVeiculo}
                placeholder="Ex: Honda CG 160"
                placeholderTextColor="#ADB5BD"
              />
            </View>

            <Text style={styles.label}>PLACA</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="barcode-outline" size={20} color="#ADB5BD" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={placa}
                onChangeText={setPlaca}
                placeholder="ABC-1234"
                autoCapitalize="characters"
                placeholderTextColor="#ADB5BD"
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Documentação</Text>
            <Text style={styles.label}>NÚMERO DA CNH</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#ADB5BD" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={cnh}
                onChangeText={setCnh}
                keyboardType="numeric"
                placeholder="Somente números"
                placeholderTextColor="#ADB5BD"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>CONCLUIR CADASTRO</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Ao se cadastrar, você concorda com nossos Termos de Parceria e Políticas de Privacidade.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#EEE'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  container: { padding: 20 },

  infoSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  iconBadge: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFFFF4',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6C757D', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },

  card: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#ADB5BD', marginBottom: 8, letterSpacing: 1 },

  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F5',
    borderRadius: 12, marginBottom: 20, paddingHorizontal: 15, height: 55
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#333' },

  divider: { height: 1, backgroundColor: '#F1F3F5', marginVertical: 10, marginBottom: 25 },

  button: {
    backgroundColor: '#28a745', height: 60, borderRadius: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#28a745', shadowOpacity: 0.3, shadowRadius: 10,
    marginTop: 10
  },
  buttonDisabled: { backgroundColor: '#A5D6A7' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  termsText: {
    fontSize: 12, color: '#ADB5BD', textAlign: 'center',
    marginTop: 20, lineHeight: 18, paddingHorizontal: 30
  }
});