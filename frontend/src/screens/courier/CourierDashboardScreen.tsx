import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
  ActivityIndicator, SafeAreaView, StatusBar, Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
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
  const { user, signOut } = useAuth();
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
      const newSocket = io(socketURL as string);

      try {
        const response = await api.get('/api/bags/available');
        if (Array.isArray(response.data)) {
          setRequests(response.data);
        }
      } catch (error) {
        console.log("Erro ao buscar entregas:", error);
      }

      newSocket.on('connect', () => {
        newSocket.emit('join_entregadores');
      });

      newSocket.on('NOVA_ENTREGA_DISPONIVEL', (data: DeliveryRequest) => {
        setRequests((prev) => [data, ...prev]);
      });

      socketRef.current = newSocket;
      setIsOnline(true);
    }
  };

  const handleAccept = async (request: DeliveryRequest) => {
    try {
      await api.post(`/api/bags/${request.bagId}/accept`);
      Alert.alert('Sucesso', 'Entrega aceita! Dirija-se à loja.');
      setRequests((prev) => prev.filter(req => req.bagId !== request.bagId));
      navigation.navigate('PickupScreen', { bag: request });
    } catch (error: any) {
      Alert.alert('Ops!', error.response?.data?.message || 'Erro ao aceitar.');
      setRequests((prev) => prev.filter(req => req.bagId !== request.bagId));
    }
  };

  const renderItem = ({ item }: { item: DeliveryRequest }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.priceBadge}>
          <Text style={styles.priceLabel}>GANHO ESTIMADO</Text>
          <Text style={styles.priceValue}>R$ {item.valorFrete.toFixed(2)}</Text>
        </View>
        <View style={styles.distanceBadge}>
          <Ionicons name="map-outline" size={14} color="#666" />
          <Text style={styles.distanceText}>{item.distancia}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeIcons}>
          <Ionicons name="radio-button-on" size={18} color="#28a745" />
          <View style={styles.routeLine} />
          <Ionicons name="location" size={18} color="#dc3545" />
        </View>

        <View style={styles.routeDetails}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>RETIRADA (LOJA)</Text>
            <Text style={styles.addressText} numberOfLines={1}>{item.origem}</Text>
          </View>

          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>ENTREGA (CLIENTE)</Text>
            <Text style={styles.addressText} numberOfLines={1}>
              {item.destino?.rua}, {item.destino?.numero} - {item.destino?.bairro}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item)}>
        <Text style={styles.acceptButtonText}>ACEITAR ENTREGA</Text>
        <Ionicons name="flash" size={20} color="#FFF" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Olá, {user?.nome?.split(' ')[0]}</Text>
          <Text style={styles.statusInfo}>{isOnline ? 'Você está visível' : 'Você está invisível'}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>

      <View style={[styles.statusToggleCard, isOnline && styles.statusToggleCardOnline]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons
            name="motorbike"
            size={32}
            color={isOnline ? "#28a745" : "#ADB5BD"}
            style={{ opacity: isOnline ? 1 : 0.5 }}
          />
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.toggleTitle}>{isOnline ? 'Online para entregas' : 'Ficar Online'}</Text>
            <Text style={styles.toggleSubtitle}>
              {isOnline ? 'Aguardando novas malas...' : 'Ative para receber corridas'}
            </Text>
          </View>
        </View>
        <Switch
          trackColor={{ false: "#DEE2E6", true: "#A5D6A7" }}
          thumbColor={isOnline ? "#28a745" : "#ADB5BD"}
          onValueChange={toggleOnline}
          value={isOnline}
        />
      </View>

      {!isOnline ? (
        <EmptyState
          icon="power"
          title="Você está Offline"
          description="Ative sua disponibilidade no topo para começar a ver as entregas disponíveis em Sorocaba."
        />
      ) : requests.length === 0 ? (
        <View style={styles.waitingContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.waitingTitle}>Buscando malas...</Text>
          <Text style={styles.waitingSubtitle}>Isso pode levar alguns segundos</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.bagId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE'
  },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  statusInfo: { fontSize: 14, color: '#6C757D' },
  logoutBtn: { padding: 8, backgroundColor: '#FFF5F5', borderRadius: 12 },

  statusToggleCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    margin: 16, padding: 20, backgroundColor: '#FFF', borderRadius: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10
  },
  statusToggleCardOnline: { borderColor: '#A5D6A7', borderWidth: 1 },
  toggleTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  toggleSubtitle: { fontSize: 12, color: '#ADB5BD' },

  listContent: { padding: 16, paddingBottom: 100 },
  waitingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  waitingTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15 },
  waitingSubtitle: { fontSize: 14, color: '#ADB5BD', textAlign: 'center', marginTop: 5 },

  card: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16,
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  priceBadge: { backgroundColor: '#EFFFF4', padding: 10, borderRadius: 12 },
  priceLabel: { fontSize: 10, fontWeight: 'bold', color: '#28a745', letterSpacing: 0.5 },
  priceValue: { fontSize: 24, fontWeight: 'bold', color: '#28a745' },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F5', padding: 8, borderRadius: 8 },
  distanceText: { fontSize: 12, fontWeight: 'bold', color: '#666', marginLeft: 4 },

  routeContainer: { flexDirection: 'row', marginBottom: 20 },
  routeIcons: { alignItems: 'center', marginRight: 15, paddingVertical: 5 },
  routeLine: { width: 2, flex: 1, backgroundColor: '#F1F3F5', marginVertical: 4 },
  routeDetails: { flex: 1, justifyContent: 'space-between' },
  addressBlock: { marginBottom: 10 },
  addressLabel: { fontSize: 10, fontWeight: 'bold', color: '#ADB5BD', marginBottom: 2 },
  addressText: { fontSize: 15, color: '#333', fontWeight: '500' },

  acceptButton: {
    backgroundColor: '#1A1A1A', height: 55, borderRadius: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
  },
  acceptButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});