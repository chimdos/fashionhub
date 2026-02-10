import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

export const DeliveryRouteScreen = ({ route, navigation }: any) => {
  const { bag } = route.params;
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const isReturn = bag?.status === 'EM_ROTA_DEVOLUCAO' || bag?.tipo === 'COLETA';

  const openMaps = () => {
    const dest = bag?.destino;
    if (!dest) return;

    const addressQuery = typeof dest === 'string'
      ? dest
      : `${dest.rua}, ${dest.numero}, ${dest.bairro}, ${dest.cidade || 'Sorocaba'}`;

    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(addressQuery)}`,
      android: `geo:0,0?q=${encodeURIComponent(addressQuery)}`
    }) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`;

    Linking.openURL(url).catch(() => {
      Toast.show({
        type: 'error',
        text1: 'Erro no GPS',
        text2: 'Não conseguimos abrir o aplicativo de mapas.'
      });
    });
  };

  const handleFinishDelivery = async () => {
    const bagId = bag?.bagId || bag?.id;

    if (token.length < 6) {
      return Toast.show({
        type: 'info',
        text1: 'Código do Cliente',
        text2: 'Solicite o código de segurança para finalizar.'
      });
    }

    setLoading(true);
    try {
      await api.post(`/api/bags/${bagId}/confirm-delivery`, { token });

      Toast.show({
        type: 'success',
        text1: 'Entrega Finalizada!',
        text2: 'Mala entregue com sucesso. Voltando ao início...'
      });

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs', params: { screen: 'Dashboard' } }],
        });
      }, 1500);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro na Entrega',
        text2: error.response?.data?.message || 'Código inválido ou falha de conexão.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isReturn && { backgroundColor: '#2c3e50' }]}>
      <View style={styles.headerCard}>
        <Text style={[styles.stepTitle, isReturn && { color: '#E67E22' }]}>
          {isReturn ? 'PASSO 2: DEVOLUÇÃO À LOJA' : 'PASSO 2: ENTREGA AO CLIENTE'}
        </Text>

        <Text style={styles.clientName}>
          {isReturn ? (bag?.origem?.includes('Loja') ? 'FashionHub Central' : 'Loja de Destino') : (bag?.clienteNome || 'Cliente FashionHub')}
        </Text>

        <View style={styles.addressBox}>
          <Text style={styles.addressLabel}>Destino Final:</Text>
          <Text style={styles.addressText}>
            {typeof bag?.destino === 'string' ? bag.destino : `${bag?.destino?.rua}, ${bag?.destino?.numero}`}
          </Text>
          {bag?.destino?.bairro && <Text style={styles.addressSubText}>{bag.destino.bairro}</Text>}
        </View>

        <TouchableOpacity onPress={openMaps} style={[styles.mapButton, isReturn && { backgroundColor: '#E67E22' }]}>
          <Ionicons name="navigate" size={18} color="#fff" />
          <Text style={styles.mapButtonText}>ABRIR NAVEGAÇÃO GPS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionArea}>
        <Text style={styles.instruction}>
          {isReturn
            ? 'Entregue a mala ao lojista e peça o código de recebimento dele.'
            : 'Ao chegar, entregue a mala e peça o código ao cliente para encerrar.'}
        </Text>

        <TextInput
          style={[styles.input, isReturn && { color: '#E67E22' }]}
          placeholder="000000"
          keyboardType="numeric"
          maxLength={6}
          value={token}
          onChangeText={setToken}
        />

        <TouchableOpacity
          style={[
            styles.finishButton,
            isReturn && { backgroundColor: '#E67E22' },
            (loading || token.length < 6) && styles.disabledBtn
          ]}
          onPress={handleFinishDelivery}
          disabled={loading || token.length < 6}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.finishText}>
              {isReturn ? 'FINALIZAR DEVOLUÇÃO' : 'FINALIZAR ENTREGA'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#34495e' },
  headerCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5
  },
  stepTitle: { color: '#27ae60', fontWeight: 'bold', letterSpacing: 1, marginBottom: 10 },
  clientName: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15 },
  addressBox: { marginBottom: 20 },
  addressLabel: { color: '#7f8c8d', fontSize: 12 },
  addressText: { fontSize: 18, color: '#34495e', fontWeight: '500' },
  addressSubText: { fontSize: 14, color: '#95a5a6' },

  mapButton: {
    backgroundColor: '#2980b9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  mapButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

  actionArea: { flex: 1, padding: 24, justifyContent: 'center' },
  instruction: { color: '#ecf0f1', textAlign: 'center', marginBottom: 20, fontSize: 16 },
  input: {
    backgroundColor: '#fff',
    fontSize: 24,
    textAlign: 'center',
    padding: 15,
    borderRadius: 10,
    letterSpacing: 5,
    marginBottom: 20,
    fontWeight: 'bold'
  },
  finishButton: { backgroundColor: '#27ae60', padding: 20, borderRadius: 10, alignItems: 'center' },
  disabledBtn: { opacity: 0.6 },
  finishText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});