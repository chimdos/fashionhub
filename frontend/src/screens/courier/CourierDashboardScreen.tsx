import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
  ActivityIndicator, SafeAreaView, StatusBar, Switch
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';

interface DeliveryRequest {
  bagId: string;
  origem: string;
  enderecoColeta?: {
    rua: string;
    numero: string;
    bairro: string;
  };
  destino: any;
  valorFrete: number;
  distancia: string;
  status: 'AGUARDANDO_MOTO' | 'EM_ROTA_DEVOLUCAO' | 'EM_ROTA_ENTREGA' | 'ENTREGUE' | 'FINALIZADA' | 'MOTO_A_CAMINHO_LOJA' | 'MOTO_A_CAMINHO_COLETA';
  dataSolicitacao?: string;
  tipo: 'ENTREGA' | 'COLETA';
  clienteNome?: string;
}

export const CourierDashboardScreen = () => {
  const { user, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
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
      const isReturn = request.tipo === 'COLETA';
      await api.post(`/api/bags/${request.bagId}/accept`);

      Alert.alert(
        'Sucesso',
        isReturn
          ? 'Coleta aceita! Dirija-se à casa do cliente.'
          : 'Entrega aceita! Dirija-se à loja.'
      );

      setRequests((prev) => prev.filter(req => req.bagId !== request.bagId));

      navigation.navigate('PickupScreen', { bag: request });
    } catch (error: any) {
      Alert.alert('Ops!', error.response?.data?.message || 'Erro ao aceitar.');
      setRequests((prev) => prev.filter(req => req.bagId !== request.bagId));
    }
  };

  const fetchActiveDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/bags/active-deliveries');
      if (Array.isArray(response.data)) {
        setActiveDeliveries(response.data);
      }
    } catch (error) {
      console.log("Erro ao buscar entregas ativas:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveDeliveries();
    }, [])
  );

  const renderItem = ({ item }: { item: DeliveryRequest }) => {
    const isAvailable = activeTab === 'available';
    const isReturn = item.tipo === 'COLETA';

    const getStatusInfo = (status: string) => {
      switch (status) {
        case 'MOTO_A_CAMINHO_LOJA':
          return { label: 'Indo p/ Loja', color: '#3498db' };
        case 'EM_ROTA_ENTREGA':
          return { label: 'Entregando ao Cliente', color: '#2ecc71' };

        case 'MOTO_A_CAMINHO_COLETA':
          return { label: 'Indo p/ Coleta', color: '#E67E22' };
        case 'EM_ROTA_DEVOLUCAO':
          return { label: 'Devolvendo à Loja', color: '#D35400' };

        case 'AGUARDANDO_MOTO':
          return { label: 'Aguardando Retirada', color: '#f39c12' };
        case 'AGUARDANDO_MOTO_DEVOLUCAO':
          return { label: 'Aguardando Coleta', color: '#E67E22' };

        default:
          return { label: 'Em Andamento', color: '#95a5a6' };
      }
    };

    const statusInfo = getStatusInfo(item.status);

    return (
      <View style={[styles.card, !isAvailable && isReturn && { borderLeftWidth: 5, borderLeftColor: '#E67E22' }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.priceBadge, isReturn && { backgroundColor: '#FFF4ED' }]}>
            <Text style={[styles.priceLabel, isReturn && { color: '#E67E22' }]}>
              {isReturn ? 'COLETA (VOLTA)' : 'ENTREGA (IDA)'}
            </Text>
            <Text style={[styles.priceValue, isReturn && { color: '#E67E22' }]}>
              R$ {Number(item.valorFrete || 0).toFixed(2)}
            </Text>
          </View>

          {isAvailable ? (
            <View style={styles.distanceBadge}>
              <Ionicons name="map-outline" size={14} color="#666" />
              <Text style={styles.distanceText}>{item.distancia}</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>
            </View>
          )}
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routeIcons}>
            <Ionicons name={isReturn ? "home" : "business"} size={18} color={isReturn ? "#E67E22" : "#28a745"} />
            <View style={styles.routeLine} />
            <Ionicons name={isReturn ? "business" : "location"} size={18} color={isReturn ? "#28a745" : "#dc3545"} />
          </View>

          <View style={styles.routeDetails}>
            <View style={styles.addressBlock}>
              <Text style={styles.addressLabel}>{isReturn ? 'RETIRAR COM CLIENTE' : 'RETIRAR NA LOJA'}</Text>
              <Text style={styles.addressText} numberOfLines={1}>{item.origem}</Text>
            </View>

            <View style={styles.addressBlock}>
              <Text style={styles.addressLabel}>{isReturn ? 'ENTREGAR NA LOJA' : 'ENTREGAR AO CLIENTE'}</Text>
              <Text style={styles.addressText} numberOfLines={1}>
                {typeof item.destino === 'string' ? item.destino : `${item.destino?.rua}, ${item.destino?.numero}`}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.acceptButton, isReturn && { backgroundColor: '#E67E22' }, !isAvailable && { backgroundColor: '#333' }]}
          onPress={() => {
            if (isAvailable) {
              handleAccept(item);
            } else {
              const estaNoPasso2 = ['EM_ROTA_ENTREGA', 'EM_ROTA_DEVOLUCAO'].includes(item.status);

              if (estaNoPasso2) {
                navigation.navigate('DeliveryRoute', { bag: item });
              } else {
                navigation.navigate('PickupScreen', { bag: item });
              }
            }
          }}
        >
          <Text style={styles.acceptButtonText}>
            {isAvailable ? (isReturn ? 'ACEITAR COLETA' : 'ACEITAR ENTREGA') : 'VER DETALHES'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
          <MaterialCommunityIcons name="motorbike" size={32} color={isOnline ? "#28a745" : "#ADB5BD"} style={{ opacity: isOnline ? 1 : 0.5 }} />
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.toggleTitle}>{isOnline ? 'Online para entregas' : 'Ficar Online'}</Text>
            <Text style={styles.toggleSubtitle}>{isOnline ? 'Aguardando novas malas...' : 'Ative para receber corridas'}</Text>
          </View>
        </View>
        <Switch trackColor={{ false: "#DEE2E6", true: "#A5D6A7" }} thumbColor={isOnline ? "#28a745" : "#ADB5BD"} onValueChange={toggleOnline} value={isOnline} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'available' && styles.tabButtonActive]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>Disponíveis</Text>
          {requests.length > 0 && <View style={styles.dot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>Em Andamento</Text>
          {activeDeliveries.length > 0 && <View style={[styles.dot, { backgroundColor: '#3498db' }]} />}
        </TouchableOpacity>
      </View>

      {activeTab === 'available' ? (
        !isOnline ? (
          <EmptyState
            icon="power"
            title="Você está Offline"
            description="Ative sua disponibilidade no topo para começar a ver as entregas disponíveis na região."
            buttonText="FICAR ONLINE"
            onPress={toggleOnline}
          />
        ) : requests.length === 0 ? (
          <EmptyState
            icon="search"
            title="Buscando malas..."
            description="No momento não há novas solicitações. Fique atento, assim que uma loja solicitar, ela aparecerá aqui!"
          />
        ) : (
          <>
            <View style={styles.infoAlert}>
              <Ionicons name="information-circle" size={18} color="#004085" />
              <Text style={styles.infoAlertText}>
                Toque em um card para **aceitar a entrega** automaticamente.
              </Text>
            </View>

            <FlatList
              data={requests}
              keyExtractor={(item) => item.bagId}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
          </>
        )
      ) : (
        loading ? (
          <View style={styles.waitingContainer}>
            <ActivityIndicator size="large" color="#28a745" />
          </View>
        ) : activeDeliveries.length === 0 ? (
          <EmptyState
            icon="bicycle"
            title="Nenhuma entrega ativa"
            description="As malas que você aceitar na aba 'Disponíveis' aparecerão aqui para você gerenciar a rota."
            buttonText="VER DISPONÍVEIS"
            onPress={() => setActiveTab('available')}
          />
        ) : (
          <FlatList
            data={activeDeliveries}
            keyExtractor={(item) => item.bagId}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )
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
  acceptButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  tabButtonActive: {
    backgroundColor: '#F8F9FA',
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: '#ADB5BD',
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#1A1A1A'
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#28a745',
    marginLeft: 6
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  infoAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F3FF',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8DAFF',
  },
  infoAlertText: {
    fontSize: 13,
    color: '#004085',
    marginLeft: 8,
    flex: 1,
  },
});