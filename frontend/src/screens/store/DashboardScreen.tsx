import React, { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import Toast from 'react-native-toast-message';

interface BagRequest {
  id: string;
  status: string;
  tipo: 'ABERTA' | 'FECHADA';
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
  const navigation = useNavigation<any>();

  const BASE_URL = api.defaults.baseURL;

  const fetchBagRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/bags/store');
      setBagRequests(response.data);
    } catch (err: any) {
      console.error("Erro ao buscar solicitações:", err.response?.data || err.message);
      Toast.show({
        type: 'error',
        text1: 'Não foi possível carregar as solicitações.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBagRequests();
    }, [])
  );

  const getStatusDetails = (status: string) => {
    const key = status?.toUpperCase();

    const styles: any = {
      'SOLICITADA': { label: 'Novo Pedido', color: '#E67E22', bg: '#FDEBD0' },
      'ANALISE': { label: 'Em Análise', color: '#E67E22', bg: '#FDEBD0' },

      'PREPARANDO': { label: 'Em Preparo', color: '#3498DB', bg: '#EBF5FB' },
      'RECUSADA': { label: 'Recusada', color: '#E74C3C', bg: '#FDEDEC' },

      'AGUARDANDO_MOTO': { label: 'Buscando Moto', color: '#9B59B6', bg: '#F5EEF8' },
      'MOTO_A_CAMINHO_LOJA': { label: 'Moto vindo buscar', color: '#8E44AD', bg: '#F5EEF8' },
      'EM_ROTA_ENTREGA': { label: 'Em Rota de Entrega', color: '#27AE60', bg: '#EAFAF1' },
      'ENTREGUE': { label: 'Com o Cliente', color: '#2ECC71', bg: '#D4EFDF' },

      'AGUARDANDO_MOTO_DEVOLUCAO': { label: 'Aguardando Coleta', color: '#D35400', bg: '#FDF2E9' },
      'MOTO_A_CAMINHO_COLETA': { label: 'Moto indo coletar', color: '#D35400', bg: '#FDF2E9' },
      'EM_ROTA_DEVOLUCAO': { label: 'Voltando para Loja', color: '#A04000', bg: '#F6DDCC' },

      'FINALIZADA': { label: 'Finalizada', color: '#2C3E50', bg: '#EBEDEF' },
      'CANCELADA': { label: 'Cancelada', color: '#7F8C8D', bg: '#F2F4F4' },
    };

    return styles[key] || { label: status, color: '#7F8C8D', bg: '#F2F4F4' };
  };

  const renderRequest = ({ item }: { item: BagRequest }) => {
    const primeiraImagem = item.itens[0]?.variacao_produto?.produto?.imagens[0]?.url_imagem;
    const statusInfo = getStatusDetails(item.status);

    const isAberta = item.tipo === 'ABERTA';

    const isReturning = [
      'AGUARDANDO_MOTO_DEVOLUCAO',
      'MOTO_A_CAMINHO_COLETA',
      'EM_ROTA_DEVOLUCAO'
    ].includes(item.status.toUpperCase());

    return (
      <TouchableOpacity
        style={[styles.requestCard, isReturning && styles.returningCardBorder]}
        onPress={() => navigation.navigate('BagDetails', { bagId: item.id })}
        activeOpacity={0.7}
      >
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
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.cardTitle}>Mala #{item.id.substring(0, 6).toUpperCase()}</Text>

                {isReturning && (
                  <Ionicons name="reload-circle" size={16} color="#D35400" style={{ marginLeft: 5 }} />
                )}
              </View>

              <View style={[styles.typeBadge, isAberta ? styles.typeAberta : styles.typeFechada]}>
                <Ionicons
                  name={isAberta ? "bulb-outline" : "lock-closed-outline"}
                  size={10}
                  color={isAberta ? "#8E44AD" : "#666"}
                />
                <Text style={[styles.typeBadgeText, { color: isAberta ? "#8E44AD" : "#666" }]}>
                  {isAberta ? "MALA ABERTA" : "MALA FECHADA"}
                </Text>
              </View>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={14} color="#666" />
            <Text style={styles.cardInfo}>{item.cliente.nome}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="shirt-outline" size={14} color="#666" />
            <Text style={styles.cardInfo}>{item.itens.length} {item.itens.length === 1 ? 'item' : 'itens'} selecionados</Text>
          </View>

          <View style={styles.footerRow}>
            <Ionicons name="calendar-outline" size={12} color="#999" />
            <Text style={styles.cardDate}>
              {new Date(item.data_solicitacao).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
        <View style={styles.arrowIcon}>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Painel do Lojista</Text>
          <Text style={styles.headerTitle}>Solicitações</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchBagRequests}>
          <Ionicons name="refresh" size={22} color="#28a745" />
        </TouchableOpacity>
      </View>

      {isLoading && bagRequests.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#28a745" />
        </View>
      ) : (
        <FlatList
          data={bagRequests}
          renderItem={renderRequest}
          refreshing={isLoading}
          onRefresh={fetchBagRequests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="file-tray-outline" size={50} color="#CCC" />
              </View>
              <Text style={styles.emptyTitle}>Tudo limpo por aqui!</Text>
              <Text style={styles.emptyText}>Você não tem nenhuma solicitação de mala pendente no momento.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#F8F9FA',
  },
  welcomeText: { fontSize: 14, color: '#666', fontWeight: '500' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
  refreshButton: {
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  list: { padding: 20, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  requestCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  productImage: {
    width: 85,
    height: 85,
    borderRadius: 15,
    backgroundColor: '#F1F3F5',
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardInfo: { fontSize: 14, color: '#666', marginLeft: 6 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cardDate: { fontSize: 12, color: '#ADB5BD', marginLeft: 4 },
  arrowIcon: {
    marginLeft: 10,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptyText: { fontSize: 14, color: 'gray', textAlign: 'center', lineHeight: 20 },

  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  typeAberta: {
    backgroundColor: '#F5EEF8',
  },
  typeFechada: {
    backgroundColor: '#F1F3F5',
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 3,
    letterSpacing: 0.5,
  },

  returningCardBorder: {
    borderLeftWidth: 5,
    borderLeftColor: '#E67E22',
  },
});