import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import api from '../../services/api';
import Toast from 'react-native-toast-message';

export const PickupScreen = ({ route, navigation }: any) => {
  const { bag } = route.params;
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const nomeLoja = bag?.origem || 'Loja Parceira';

  const rua = bag?.enderecoColeta?.rua;
  const numero = bag?.enderecoColeta?.numero;
  const bairro = bag?.enderecoColeta?.bairro;

  const enderecoColeta = rua
    ? `${rua}, ${numero || 'S/N'} - ${bairro || ''}`
    : 'FashionHub Central (Endereço não carregado)';

  const openMaps = () => {
    const address = bag?.enderecoColeta?.rua
      ? `${rua}, ${numero}, ${bag?.enderecoColeta?.cidade}`
      : bag?.origem || 'Sorocaba';

    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
    }) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    Linking.openURL(url).catch(() => {
      Toast.show({
        type: 'error',
        text1: 'Erro no Mapa',
        text2: 'Não foi possível abrir o aplicativo de mapas.'
      });
    });
  };

  const handleConfirmPickup = async () => {
    if (token.length < 6) {
      return Toast.show({
        type: 'info',
        text1: 'Token incompleto',
        text2: 'O código deve ter exatamente 6 dígitos.'
      });
    }

    setLoading(true);
    try {
      const bagId = bag?.id || bag?.bagId;
      const response = await api.post(`/api/bags/${bag.bagId || bag.id}/confirm-pickup`, { token });

      Toast.show({
        type: 'success',
        text1: 'Mala retirada!',
        text2: 'Inicie a rota para o cliente.'
      });

      navigation.replace('DeliveryRoute', {
        bag: { ...bag, ...response.data.bag }
      });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Token inválido ou erro de servidor.';
      Toast.show({
        type: 'error',
        text1: 'Falha na retirada',
        text2: msg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.stepTitle}>PASSO 1: RETIRADA</Text>
        <Text style={styles.storeName}>{nomeLoja}</Text>
        <Text style={styles.address}>{enderecoColeta}</Text>

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
        style={[styles.confirmButton, (loading || token.length < 6) && styles.disabledBtn]}
        onPress={handleConfirmPickup}
        disabled={loading || token.length < 6}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmText}>CONFIRMAR RETIRADA</Text>
        )}
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