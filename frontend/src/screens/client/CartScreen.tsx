import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useBag } from '../../contexts/BagContext';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export const CartScreen = () => {
  const navigation = useNavigation<any>();
  const { items, itemCount, clearBag, removeFromBag } = useBag();
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [requestedBags, setRequestedBags] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bagType, setBagType] = useState<'FECHADA' | 'ABERTA'>('FECHADA');

  const [activeBagWithClient, setActiveBagWithClient] = useState<any>(null);

  const checkActiveBag = async () => {
    try {
      const response = await api.get('/api/bags/active-with-client');
      setActiveBagWithClient(response.data);
    } catch (error) {
      console.error("Erro ao verificar mala ativa:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkActiveBag();
    }, [])
  );

  const totalValue = items.reduce((acc, item) => acc + item.preco, 0);

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalValue);

  const fetchRequestedBags = async () => {
    try {
      setIsRefreshing(true);
      const response = await api.get('/api/bags');
      setRequestedBags(response.data.bags || response.data);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setIsRefreshing(false)
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchRequestedBags();
    }
  }, [activeTab]);

  useEffect(() => {
    checkActiveBag();
  }, []);

  const handleRequestBag = async () => {
    if (itemCount === 0) {
      Toast.show({
        type: 'info',
        text1: 'Mala Vazia',
        text2: 'Adicione alguns itens antes de solicitar!',
        position: 'bottom'
      });
      return;
    }
    setIsLoading(true);
    try {
      const requestData = {
        endereco_entrega_id: "138f14a4-e4a8-4f71-a2dc-3d9a28445ae0",
        tipo: bagType,
        itens: items.map(item => ({
          variacao_produto_id: item.id,
          quantidade: 1
        }))
      };
      await api.post('/api/bags', requestData);
      Toast.show({
        type: 'success',
        text1: 'Mala Solicitada!',
        text2: 'O lojista preparará tudo em breve.',
      });
      clearBag();
      setActiveTab('history');
    } catch (error: any) {
      console.error("Erro ao solicitar a mala:", error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Ops! Algo deu errado',
        text2: 'Não conseguimos solicitar sua mala agora.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentBagItem = ({ item }: { item: any }) => (
    <View style={styles.itemLightWrapper}>
      <View style={styles.itemDarkWrapper}>
        <View style={styles.itemContainer}>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={1}>{item.nome}</Text>
            <Text style={styles.itemVariation}>{`${item.tamanho} - ${item.cor}`}</Text>
            <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2)}</Text>
          </View>
          <TouchableOpacity onPress={() => removeFromBag(item.id)} style={styles.removeButton}>
            <Ionicons name="trash-outline" size={22} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHistoryItem = ({ item }: { item: any }) => {
    const getStatusStyle = (status: string) => {
      const key = status?.toUpperCase();
      const styles: any = {
        'SOLICITADA': { label: 'Pendente', color: '#E67E22', bg: '#FEF5E7' },
        'ANALISE': { label: 'Em Análise', color: '#E67E22', bg: '#FEF5E7' },
        'PREPARANDO': { label: 'Em Preparo', color: '#3498DB', bg: '#EBF5FB' },
        'AGUARDANDO_MOTO': { label: 'Buscando Moto', color: '#8E44AD', bg: '#F5EEF8' },
        'MOTO_A_CAMINHO_LOJA': { label: 'Moto a caminho', color: '#8E44AD', bg: '#F5EEF8' },
        'EM_ROTA_ENTREGA': { label: 'Em Rota', color: '#27AE60', bg: '#EAFAF1' },
        'ENTREGUE': { label: 'Com você', color: '#2ECC71', bg: '#D4EFDF' },
        'AGUARDANDO_MOTO_DEVOLUCAO': { label: 'Aguardando Coleta', color: '#D35400', bg: '#FDF2E9' },
        'MOTO_A_CAMINHO_COLETA': { label: 'Moto vindo buscar', color: '#D35400', bg: '#FDF2E9' },
        'EM_ROTA_DEVOLUCAO': { label: 'Voltando à loja', color: '#A04000', bg: '#F6DDCC' },
        'FINALIZADA': { label: 'Finalizada', color: '#2C3E50', bg: '#EBEDEF' },
        'RECUSADA': { label: 'Recusada', color: '#E74C3C', bg: '#FDEDEC' },
        'CANCELADA': { label: 'Cancelada', color: '#7F8C8D', bg: '#F2F4F4' },
      };
      return styles[key] || { label: status, color: '#7F8C8D', bg: '#F2F4F4' };
    };

    const currentStatus = getStatusStyle(item.status);

    const rawDate = item.data_solicitacao || item.created_at || item.createdAt;

    const formattedDate = (() => {
      if (!rawDate) return 'Data indisponível';

      const dateString = rawDate.endsWith('Z') ? rawDate : `${rawDate}Z`;
      const date = new Date(dateString);

      if (isNaN(date.getTime())) return 'Data inválida';

      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
      }).replace(',', ' às');
    })();

    return (
      <View style={styles.itemLightWrapper}>
        <View style={styles.itemDarkWrapper}>
          <TouchableOpacity
            style={styles.historyCard}
            onPress={() => navigation.navigate('BagDetails', { bagId: item.id })}
            activeOpacity={0.7}
          >
            <View style={styles.historyHeader}>
              <View>
                <Text style={styles.historyId}>Mala #{item.id.substring(0, 8).toUpperCase()}</Text>
                <View style={[styles.miniTypeBadge, { backgroundColor: item.tipo === 'ABERTA' ? '#F5EEF8' : '#F2F4F4' }]}>
                  <Text style={[styles.miniTypeText, { color: item.tipo === 'ABERTA' ? '#9B59B6' : '#34495E' }]}>
                    {item.tipo === 'ABERTA' ? 'ABERTA' : 'FECHADA'}
                  </Text>
                </View>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: currentStatus.bg }]}>
                <Text style={[styles.statusText, { color: currentStatus.color, fontSize: 10 }]}>
                  {currentStatus.label.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.historyInfoRow}>
              <Ionicons name="calendar-outline" size={14} color="#888" />
              <Text style={styles.historyDate}> {formattedDate}</Text>
            </View>

            <View style={styles.historyInfoRow}>
              <Ionicons name="shirt-outline" size={14} color="#333" />
              <Text style={styles.historyItemsCount}> {item.itens?.length || 0} itens</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  };

  const renderBagItem = ({ item }: { item: any }) => (
    <View style={styles.itemLightWrapper}>
      <View style={styles.itemDarkWrapper}>
        <View style={styles.itemContainer}>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={1}>{item.nome}</Text>
            <Text style={styles.itemVariation}>{`${item.tamanho} - ${item.cor}`}</Text>
            <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            onPress={() => removeFromBag(item.id)}
            style={styles.removeButton}
          >
            <Ionicons name="trash-outline" size={22} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.logoText}>FashionHub</Text>
        <Text style={styles.headerTitle}>Minhas Malas</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'current' && styles.tabButtonActive]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'current' && styles.tabButtonTextActive]}>Atual</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'history' && styles.tabButtonTextActive]}>Histórico</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'current' ? (
        <>
          {activeBagWithClient ? (
            <View style={styles.activeBagContainer}>
              <Text style={styles.sectionTitle}>Status da sua mala</Text>

              {activeBagWithClient.status === 'ENTREGUE' ? (
                <TouchableOpacity
                  style={styles.manageCard}
                  onPress={() => navigation.navigate('BagSelection', { bag: activeBagWithClient })}
                  activeOpacity={0.8}
                >
                  <View style={styles.manageHeader}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="shirt" size={24} color="#FFF" />
                    </View>
                    <View style={styles.manageTextContent}>
                      <Text style={styles.manageTitle}>Finalizar Provador</Text>
                      <Text style={styles.manageSubtitle}>Escolha o que vai comprar e peça a coleta.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#5DADE2" />
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={[styles.manageCard, { borderColor: '#27AE60', borderWidth: 1 }]}>
                  <View style={styles.manageHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: '#27AE60' }]}>
                      <Ionicons name="bicycle" size={24} color="#FFF" />
                    </View>
                    <View style={styles.manageTextContent}>
                      <Text style={[styles.manageTitle, { color: '#27AE60' }]}>
                        {activeBagWithClient.status === 'EM_ROTA_DEVOLUCAO' ? 'Mala em Coleta' : 'Aguardando Coleta'}
                      </Text>
                      <Text style={styles.manageSubtitle}>Mostre o token abaixo ao entregador.</Text>
                    </View>
                  </View>
                  <View style={styles.tokenContainer}>
                    <Text style={styles.tokenLabel}>TOKEN DE DEVOLUÇÃO</Text>
                    <Text style={styles.tokenValue}>{activeBagWithClient.token_devolucao || '------'}</Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <>
              <FlatList
                data={items}
                renderItem={renderCurrentBagItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="bag-outline" size={80} color="#DDD" />
                    <Text style={styles.emptyText}>Sua mala está vazia.</Text>
                  </View>
                }
              />

              {itemCount > 0 && (
                <View style={styles.footer}>

                  {/* 🚀 Movemos o seletor para aqui dentro */}
                  <View style={styles.typeSelectorContainer}>
                    <Text style={styles.typeSelectorLabel}>Estilo da sua mala</Text>
                    <View style={styles.typeOptionsRow}>
                      <TouchableOpacity
                        style={[styles.typeOption, bagType === 'FECHADA' && styles.typeOptionActive]}
                        onPress={() => setBagType('FECHADA')}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={18}
                          color={bagType === 'FECHADA' ? '#FFF' : '#888'}
                        />
                        <Text style={[styles.typeOptionText, bagType === 'FECHADA' && styles.typeOptionTextActive]}>
                          Fechada
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.typeOption, bagType === 'ABERTA' && styles.typeOptionActive]}
                        onPress={() => setBagType('ABERTA')}
                      >
                        <Ionicons
                          name="bulb-outline"
                          size={18}
                          color={bagType === 'ABERTA' ? '#FFF' : '#888'}
                        />
                        <Text style={[styles.typeOptionText, bagType === 'ABERTA' && styles.typeOptionTextActive]}>
                          Aberta
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total estimado:</Text>
                    <Text style={styles.totalValue}>{formattedTotal}</Text>
                  </View>

                  <View style={styles.btnLightWrapper}>
                    <View style={styles.btnDarkWrapper}>
                      <TouchableOpacity
                        style={[styles.requestButton, isLoading && styles.requestButtonDisabled]}
                        onPress={handleRequestBag}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="#333" />
                        ) : (
                          <Text style={styles.requestButtonText}>SOLICITAR MALA ({itemCount})</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </>
      ) : (
        <FlatList
          data={requestedBags}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={fetchRequestedBags} tintColor="#5DADE2" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={80} color="#DDD" />
              <Text style={styles.emptyText}>Nenhuma mala solicitada ainda.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBFCFD' },
  header: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 10 },
  logoText: { fontSize: 18, fontWeight: '900', color: '#5DADE2', marginBottom: 2 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333' },

  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 25,
    marginVertical: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    padding: 5
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12
  },
  tabButtonActive: {
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButtonText: { fontSize: 14, fontWeight: '600', color: '#888' },
  tabButtonTextActive: { color: '#5DADE2' },

  list: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 },

  itemLightWrapper: { borderRadius: 20, shadowColor: "#FFFFFF", shadowOffset: { width: -2, height: -2 }, shadowOpacity: 1, shadowRadius: 4, marginBottom: 15 },
  itemDarkWrapper: { borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemVariation: { fontSize: 14, color: '#888', marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: '700', color: '#5DADE2', marginTop: 6 },
  removeButton: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBFCFD', borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' },

  historyCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  historyId: { fontSize: 14, fontWeight: 'bold', color: '#555' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  historyDate: { fontSize: 13, color: '#888' },
  historyItemsCount: { fontSize: 14, color: '#333', fontWeight: '600', marginTop: 8 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: '#AAA', marginTop: 15, fontWeight: '500' },
  footer: { padding: 25, backgroundColor: 'rgba(251, 252, 253, 0.95)', borderTopWidth: 1, borderTopColor: '#F0F0F0', position: 'absolute', bottom: 0, width: '100%' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontSize: 16, color: '#666', fontWeight: '500' },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#333' },
  btnLightWrapper: { borderRadius: 25, shadowColor: "#FFF", shadowOffset: { width: -4, height: -4 }, shadowOpacity: 1, shadowRadius: 6 },
  btnDarkWrapper: { borderRadius: 25, shadowColor: "#4A9BCE", shadowOffset: { width: 4, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  requestButton: { backgroundColor: '#5DADE2', height: 60, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  requestButtonDisabled: { backgroundColor: '#A5D1EB' },
  requestButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  historyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#5DADE2',
    fontWeight: 'bold',
    marginRight: 5
  },
  activeBagContainer: {
    paddingHorizontal: 25,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ADB5BD',
    textTransform: 'uppercase',
    marginBottom: 15,
    letterSpacing: 1,
  },
  manageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  manageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5DADE2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#5DADE2',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  manageTextContent: {
    flex: 1,
    marginLeft: 15,
  },
  manageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  manageSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },

  tokenContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#F1F9F4',
    borderRadius: 12,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#27AE60',
  },
  tokenLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#27AE60',
    marginBottom: 5,
  },
  tokenValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#333',
    letterSpacing: 5,
  },

  typeSelectorContainer: {
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  typeSelectorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ADB5BD',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  typeOptionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F3F5',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  typeOptionActive: {
    backgroundColor: '#5DADE2',
    borderColor: '#5DADE2',
  },
  typeOptionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  typeOptionTextActive: {
    color: '#FFF',
  },
  typeDescription: {
    fontSize: 12,
    color: '#ADB5BD',
    marginTop: 8,
    fontStyle: 'italic',
  },
  miniTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  miniTypeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  statusText: {
    fontWeight: 'bold',
  }
});