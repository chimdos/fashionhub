import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import api from '../../services/api';

export const DeliveryRouteScreen = ({ route, navigation }: any) => {
  const { bag } = route.params; // Dados da mala passados pela tela anterior
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const openMaps = () => {
    // Monta o endereço completo para o GPS
    const dest = bag.destino;
    const addressQuery = `${dest.rua}, ${dest.numero} - ${dest.bairro}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressQuery)}`;
    Linking.openURL(url);
  };

  const handleFinishDelivery = async () => {
    if (token.length < 4) {
      Alert.alert('Atenção', 'Solicite o código de entrega ao cliente.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/bags/${bag.bagId}/confirm-delivery`, { token });
      
      Alert.alert('Parabéns!', 'Corrida finalizada com sucesso.');
      
      // Volta para o Dashboard para pegar novas corridas
      navigation.reset({
        index: 0,
        routes: [{ name: 'CourierDashboardScreen' }],
      });

    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Código inválido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.stepTitle}>PASSO 2: ENTREGA AO CLIENTE</Text>
        <Text style={styles.clientName}>Cliente</Text> 
        
        <View style={styles.addressBox}>
          <Text style={styles.addressLabel}>Endereço:</Text>
          <Text style={styles.addressText}>
            {bag.destino.rua}, {bag.destino.numero}
          </Text>
          <Text style={styles.addressSubText}>{bag.destino.bairro}</Text>
        </View>

        <TouchableOpacity onPress={openMaps} style={styles.mapButton}>
          <Text style={styles.mapButtonText}>INICIAR NAVEGAÇÃO GPS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionArea}>
        <Text style={styles.instruction}>
          Ao chegar, entregue a mala e peça o código ao cliente.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="CÓDIGO CLIENTE"
          keyboardType="numeric"
          maxLength={6}
          value={token}
          onChangeText={setToken}
        />

        <TouchableOpacity 
          style={[styles.finishButton, loading && styles.disabledBtn]} 
          onPress={handleFinishDelivery}
          disabled={loading}
        >
          <Text style={styles.finishText}>
            {loading ? 'FINALIZANDO...' : 'FINALIZAR ENTREGA'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#34495e' }, // Fundo escuro para diferenciar da coleta
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