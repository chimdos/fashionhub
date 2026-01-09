import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface DeliveryRequest {
  bagId: string;
  origem: string;
  destino: {
    rua: string;
    numero: string;
    bairro: string;
  };
  valorFrete: number;
  distancia: string;
}

export const CourierDashboardScreen = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const navigation = useNavigation<any>();

  const toggleOnline = async () => {
    if (isOnline) {
      socketRef.current?.disconnect();
      setRequests([]);
      setIsOnline(false);
    } else {
      const socketURL = api.defaults.baseURL;

      const newSocket = io(socketURL);

      try {
        const response = await api.get('/api/bags/available');

        if (Array.isArray(response.data)) {
          setRequests(response.data);
        } else {
          console.warn("A API de malas disponíveis não retornou um Array.");
          setRequests([]);
        }

      } catch (error) {
        console.log("Erro ao buscar entregas disponíveis:", error);
      }

      newSocket.on('connect', () => {
        console.log('⚡ Conectado ao servidor de entregas');
        newSocket.emit('join_entregadores');
      });

      newSocket.on('NOVA_ENTREGA_DISPONIVEL', (data: DeliveryRequest) => {
        console.log('📦 Nova entrega recebida via Socket:', data);
        setRequests((prev) => [data, ...prev]);
      });

      socketRef.current = newSocket;
      setIsOnline(true);
    }
  };

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleAccept = async (request: DeliveryRequest) => {
    try {
      const response = await api.post(`/api/bags/${request.bagId}/accept`);

      Alert.alert('Sucesso', 'Entrega aceita! Dirija-se à loja.');

      setRequests((prev) => prev.filter(req => req.bagId !== request.bagId));

      navigation.navigate('PickupScreen', { bag: request });

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erro ao aceitar corrida.';
      Alert.alert('Ops!', errorMsg);

      setRequests((prev) => prev.filter(req => req.bagId !== request.bagId));
    }
  };

  const renderItem = ({ item }: { item: DeliveryRequest }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.price}>R$ {item.valorFrete.toFixed(2)}</Text>
        <Text style={styles.distance}>{item.distancia}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.label}>Retirada:</Text>
        <Text style={styles.address}>{item.origem}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Entrega:</Text>
        <Text style={styles.address}>{item.destino?.rua}, {item.destino?.numero}</Text>
      </View>

      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleAccept(item)}
      >
        <Text style={styles.acceptText}>ACEITAR CORRIDA</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Olá, {user?.nome}</Text>
        <TouchableOpacity
          style={[styles.statusButton, isOnline ? styles.btnOnline : styles.btnOffline]}
          onPress={toggleOnline}
        >
          <Text style={styles.statusText}>
            {isOnline ? 'VOCÊ ESTÁ ONLINE' : 'FICAR ONLINE'}
          </Text>
        </TouchableOpacity>
      </View>

      {isOnline && requests.length === 0 ? (
        <View style={styles.waitingArea}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.waitingText}>Procurando entregas próximas...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.bagId}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff', elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  statusButton: { padding: 15, borderRadius: 8, alignItems: 'center' },
  btnOnline: { backgroundColor: '#4CAF50' },
  btnOffline: { backgroundColor: '#ccc' },
  statusText: { color: '#fff', fontWeight: 'bold' },

  waitingArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  waitingText: { marginTop: 10, color: '#666' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  price: { fontSize: 22, fontWeight: 'bold', color: '#2ecc71' },
  distance: { fontSize: 14, color: '#666', marginTop: 6 },

  cardBody: { marginBottom: 15 },
  label: { fontSize: 12, color: '#999', marginTop: 4 },
  address: { fontSize: 16, color: '#333' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },

  acceptButton: { backgroundColor: '#000', padding: 15, borderRadius: 8, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});