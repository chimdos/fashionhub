import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import api from '../../services/api';

export const PickupScreen = ({ route, navigation }: any) => {
  const { bag } = route.params;
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const openMaps = () => {
    const address = bag.endereco_entrega?.rua || bag.origem;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o mapa.');
      }
    });
  };

  const handleConfirmPickup = async () => {
    if (token.length < 6) {
      Alert.alert('Atenção', 'O código deve ter exatamente 6 dígitos!');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/bags/${bag.bagId}/confirm-pickup`, { token });

      Alert.alert('Sucesso', 'Mala retirada! Inicie a entrega.');

      navigation.replace('DeliveryRouteScreen', { bag });

    } catch (error: any) {
      Alert.alert('Falha', error.response?.data?.message || 'Token inválido ou erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.stepTitle}>PASSO 1: RETIRADA</Text>
        <Text style={styles.storeName}>Loja Fashion Hub</Text>
        <Text style={styles.address}>{bag.origem}</Text>

        <TouchableOpacity onPress={openMaps} style={styles.mapButton}>
          <Text style={styles.mapButtonText}>ABRIR NO MAPA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Código de Retirada (Peça ao Lojista)</Text>
        <TextInput
          style={styles.input}
          placeholder="000000"
          keyboardType="numeric"
          maxLength={6}
          value={token}
          onChangeText={setToken}
        />
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, loading && styles.disabledBtn]}
        onPress={handleConfirmPickup}
        disabled={loading}
      >
        <Text style={styles.confirmText}>
          {loading ? 'VALIDANDO...' : 'CONFIRMAR RETIRADA'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 30, elevation: 2 },
  stepTitle: { fontSize: 12, color: '#999', fontWeight: 'bold', marginBottom: 5 },
  storeName: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  address: { fontSize: 16, color: '#555', marginBottom: 15 },
  mapButton: { backgroundColor: '#e3f2fd', padding: 10, borderRadius: 5, alignItems: 'center' },
  mapButtonText: { color: '#2196F3', fontWeight: 'bold' },

  inputContainer: { marginBottom: 30 },
  label: { fontSize: 16, marginBottom: 10, textAlign: 'center', color: '#333' },
  input: {
    backgroundColor: '#fff', fontSize: 32, textAlign: 'center', letterSpacing: 5,
    padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd'
  },

  confirmButton: { backgroundColor: '#2ecc71', padding: 18, borderRadius: 8, alignItems: 'center' },
  disabledBtn: { opacity: 0.7 },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});