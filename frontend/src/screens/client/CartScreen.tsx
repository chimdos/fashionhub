import React, { useContext, useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';

export const CartScreen = () => {
  const navigation = useNavigation<any>();
  const { items, itemCount, clearBag, removeFromBag } = useBag();
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [requestedBags, setRequestedBags] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRequestBag = async () => {
    if (itemCount === 0) {
      Alert.alert("Atenção", "Sua mala está vazia. Adicione alguns itens primeiro!");
      return;
    }
    setIsLoading(true);
    try {
      const requestData = {
        endereco_entrega_id: "138f14a4-e4a8-4f71-a2dc-3d9a28445ae0",
        itens: items.map(item => ({
          variacao_produto_id: item.id,
          quantidade: 1
        }))
      };
      await api.post('/api/bags', requestData);
      Alert.alert("Sucesso!", "Sua mala foi solicitada. Em breve, um lojista irá prepará-la para você.");
      clearBag();
      setActiveTab('history');
    } catch (error: any) {
      console.error("Erro ao solicitar a mala:", error.response?.data || error);
      Alert.alert("Erro", "Não foi possível solicitar a sua mala. Tente novamente.");
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
    const statusColors: any = {
      'pendente': '#F1C40F',
      'preparando': '#5DADE2',
      'entregue': '#2ECC71',
      'cancelado': '#E74C3C'
    };

    return (
      <View style={styles.itemLightWrapper}>
        <View style={styles.itemDarkWrapper}>
          <TouchableOpacity
            style={styles.historyCard}
            onPress={() => navigation.navigate('BagDetails', { bagId: item.id })}
            activeOpacity={0.7}
          >
            <View style={styles.historyHeader}>
              <Text style={styles.historyId}>Mala #{item.id.substring(0, 8).toUpperCase()}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] || '#95A5A6' }]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.historyInfoRow}>
              <Ionicons name="calendar-outline" size={14} color="#888" />
              <Text style={styles.historyDate}> {new Date(item.created_at).toLocaleDateString('pt-BR')}</Text>
            </View>

            <View style={styles.historyInfoRow}>
              <Ionicons name="shirt-outline" size={14} color="#333" />
              <Text style={styles.historyItemsCount}> {item.itens?.length || 0} itens solicitados</Text>
            </View>

            <View style={styles.viewDetailsRow}>
              <Text style={styles.viewDetailsText}>Ver detalhes e Token</Text>
              <Ionicons name="chevron-forward" size={14} color="#5DADE2" />
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
                    {isLoading ? <ActivityIndicator color="#333" /> : <Text style={styles.requestButtonText}>SOLICITAR MALA ({itemCount})</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </>
      ) : (
        <FlatList
          data={requestedBags}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={fetchRequestedBags} tintColor="#5DADE2" />}
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
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
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
});