import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface BagRequest {
  id: string;
  status: string;
  data_solicitacao: string;
  cliente: {
    nome: string;
  };
  itens: Array<{
    variacao_produto: {
      produto: {
        nome: string;
        imagens: Array<{ url_imagem: string }>;
      };
    };
  }>;
}

export const StoreDashboardScreen = () => {
  const [bagRequests, setBagRequests] = useState<BagRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const BASE_URL = api.defaults.baseURL;

  const fetchBagRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/bags/store');
      setBagRequests(response.data);
    } catch (err: any) {
      console.error("Erro ao buscar solicitações:", err.response?.data || err.message);
      Alert.alert("Erro", "Não foi possível carregar as solicitações.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBagRequests();
  }, []);

  const renderRequest = ({ item }: { item: BagRequest }) => {
    const primeiraImagem = item.itens[0]?.variacao_produto?.produto?.imagens[0]?.url_imagem;

    return (
      <TouchableOpacity style={styles.requestCard}>
        <Image
          source={{
            uri: primeiraImagem 
              ? `${BASE_URL}${primeiraImagem}` 
              : 'https://via.placeholder.com/150' 
          }}
          style={styles.productImage}
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Solicitação #{item.id.substring(0, 6)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          
          <Text style={styles.cardInfo}><Ionicons name="person" size={14} /> {item.cliente.nome}</Text>
          <Text style={styles.cardInfo}><Ionicons name="shirt" size={14} /> {item.itens.length} itens na mala</Text>
          
          <Text style={styles.cardDate}>
            Solicitada em: {new Date(item.data_solicitacao).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SOLICITADA': return '#ffc107';
      case 'PREPARANDO': return '#17a2b8';
      case 'ENTREGUE': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Solicitações de Mala</Text>
        <TouchableOpacity onPress={fetchBagRequests}>
           <Ionicons name="refresh" size={24} color="#28a745" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={bagRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Ionicons name="basket-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma solicitação pendente.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  list: { padding: 15 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: 'gray', marginTop: 10 },
  requestCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#efefef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  cardInfo: { fontSize: 13, color: '#666', marginBottom: 2 },
  cardDate: { fontSize: 11, color: '#999', marginTop: 4 },
});