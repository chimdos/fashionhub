import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import api from '../../services/api';

// Recebemos os dados da rota anterior (via navigation params)
export const PickupScreen = ({ route, navigation }: any) => {
  const { bag } = route.params; // Objeto da mala vindo do Dashboard
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const openMaps = () => {
    // Abre o Google Maps/Waze com o endereço da loja
    // Ajustar "origem" para o campo correto do endereço da loja se for um objeto
    const address = bag.origem; 
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleConfirmPickup = async () => {
    if (token.length < 4) {
      Alert.alert('Erro', 'Digite o código de 6 dígitos fornecido pelo lojista.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/bags/${bag.bagId}/confirm-pickup`, { token });
      
      Alert.alert('Sucesso', 'Mala retirada! Inicie a entrega.');
      
      // Navega para a próxima tela: Rota até o Cliente
      // Passamos a mesma bag, mas agora o fluxo será de entrega
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