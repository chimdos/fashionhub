import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import Toast from 'react-native-toast-message';

export const BagDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { bagId } = route.params;

  const [bag, setBag] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const BASE_URL = api.defaults.baseURL;

  useEffect(() => {
    fetchBagDetails();
  }, [bagId]);

  const fetchBagDetails = async () => {
    try {
      const response = await api.get(`/api/bags/${bagId}`);
      setBag(response.data);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro de carregamento',
        text2: 'Não conseguimos abrir os detalhes desta mala.'
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'ACEITAR' | 'RECUSAR') => {
    setSubmitting(true);
    try {
      let motivo = action === 'RECUSAR' ? "Indisponibilidade de estoque no momento." : '';
      await api.post(`/api/bags/${bagId}/store-action`, { action, motivo });

      Toast.show({
        type: 'success',
        text1: action === 'ACEITAR' ? 'Mala Aceita!' : 'Mala Recusada',
        text2: `A solicitação foi processada com sucesso.`
      });
      await fetchBagDetails();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Falha na operação',
        text2: error.response?.data?.message || "Não foi possível processar a ação."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestCourier = async () => {
    setSubmitting(true);
    try {
      await api.post(`/api/bags/${bagId}/request-courier`);
      Toast.show({
        type: 'success',
        text1: 'Entregador Chamado!',
        text2: 'Aguarde a chegada do motoboy na sua loja.'
      });
      await fetchBagDetails();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao solicitar motoboy',
        text2: error.response?.data?.message || "Tente novamente em alguns instantes."
      });
    } finally {
      setSubmitting(false);
    }
  }

  const getBagTypeStyle = (tipo: string) => {
    return tipo === 'ABERTA'
      ? { label: 'MALA ABERTA', color: '#9B59B6', bg: '#F5EEF8', icon: 'bulb-outline' as const }
      : { label: 'MALA FECHADA', color: '#34495E', bg: '#F1F3F5', icon: 'lock-closed-outline' as const };
  };

  const getStatusStyle = (status: string) => {
    const map: any = {
      'SOLICITADA': { label: 'Pendente', color: '#E67E22', bg: '#FDEBD0' },
      'ANALISE': { label: 'Em Análise', color: '#E67E22', bg: '#FDEBD0' },
      'PREPARANDO': { label: 'Em Preparo', color: '#3498DB', bg: '#EBF5FB' },
      'AGUARDANDO_MOTO': { label: 'Buscando Moto', color: '#9B59B6', bg: '#F5EEF8' },
      'MOTO_A_CAMINHO_LOJA': { label: 'Moto a Caminho', color: '#9B59B6', bg: '#F5EEF8' },
      'EM_ROTA_ENTREGA': { label: 'Em Entrega', color: '#27AE60', bg: '#E9F7EF' },
      'ENTREGUE': { label: 'Entregue', color: '#28a745', bg: '#E9F7EF' },
      'FINALIZADA': { label: 'Finalizada', color: '#2C3E50', bg: '#ECF0F1' },
    };
    return map[status] || { label: status, color: '#7F8C8D', bg: '#F2F4F4' };
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  const statusStyle = getStatusStyle(bag.status);
  const typeStyle = getBagTypeStyle(bag.tipo);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(`/api/products/search-store?search=${query}`);

      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.products)) {
        data = response.data.products;
      }

      setSearchResults(data);
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddExtra = async (variacaoId: string) => {
    setSubmitting(true);
    try {
      await api.post(`/api/bags/${bagId}/extra`, {
        variacao_produto_id: variacaoId,
        quantidade: 1
      });

      Toast.show({
        type: 'success',
        text1: 'Sugestão Adicionada!',
        text2: 'O item foi incluído na mala aberta.'
      });

      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      fetchBagDetails();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao adicionar',
        text2: error.response?.data?.message || 'Tente novamente.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View>
            <Text style={styles.headerSubtitle}>Mala #{bag.id.substring(0, 6).toUpperCase()}</Text>

            <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
              <Ionicons name={typeStyle.icon} size={12} color={typeStyle.color} />
              <Text style={[styles.typeBadgeText, { color: typeStyle.color }]}>
                {typeStyle.label}
              </Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Cliente</Text>
          <View style={styles.infoCard}>
            <View style={styles.clientHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{bag.cliente.nome.charAt(0)}</Text>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.clientName}>{bag.cliente.nome}</Text>
                <Text style={styles.clientDetail}>{bag.cliente.email}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.contactRow}>
              <Ionicons name="call" size={18} color="#28a745" />
              <Text style={styles.contactText}>{bag.cliente.telefone}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
          <View style={styles.infoCard}>
            <View style={styles.addressRow}>
              <Ionicons name="location" size={20} color="#28a745" />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.addressTextBold}>
                  {bag.endereco_entrega.rua}, {bag.endereco_entrega.numero}
                </Text>
                <Text style={styles.addressText}>
                  {bag.endereco_entrega.bairro}
                </Text>
                <Text style={styles.addressText}>
                  {bag.endereco_entrega.cidade} - {bag.endereco_entrega.estado}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Itens na Mala ({bag.itens.length})</Text>

            {bag.tipo === 'ABERTA' && bag.status === 'PREPARANDO' && (
              <TouchableOpacity
                style={styles.addSuggestionBtn}
                onPress={() => setShowSearch(true)}
              >
                <Ionicons name="add-circle-outline" size={16} color="#9B59B6" />
                <Text style={styles.addSuggestionText}>Sugerir Extra</Text>
              </TouchableOpacity>
            )}
          </View>

          {bag.itens.map((item: any) => (
            <View key={item.id} style={[styles.itemRow, item.is_extra && styles.extraItemRow]}>
              <Image
                source={{ uri: `${BASE_URL}${item.variacao_produto.produto.images?.[0]?.url_imagem || item.variacao_produto.produto.imagens?.[0]?.url_imagem}` }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.variacao_produto.produto.nome}</Text>
                  {item.is_extra && (
                    <View style={styles.extraBadge}>
                      <Text style={styles.extraBadgeText}>EXTRA</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.variationText}>
                  {item.variacao_produto.tamanho} • {item.variacao_produto.cor}
                </Text>
                <Text style={styles.itemPrice}>R$ {Number(item.preco_unitario_mala).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {bag.observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <View style={styles.obsCard}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#666" style={{ marginBottom: 5 }} />
              <Text style={styles.obsText}>{bag.observacoes}</Text>
            </View>
          </View>
        )}

        {bag.status === 'AGUARDANDO_MOTO' && (
          <View style={styles.tokenCard}>
            <Ionicons name="shield-checkmark" size={32} color="#856404" />
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.tokenLabel}>Token de Retirada</Text>
              <Text style={styles.tokenValue}>{bag.token_retirada}</Text>
              <Text style={styles.tokenHint}>Confirme este código com o motoboy.</Text>
            </View>
          </View>
        )}


        {bag.entregador && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entregador Responsável</Text>
            <View style={[styles.infoCard, styles.courierCardHighlight]}>
              <View style={styles.clientHeader}>
                <View style={[styles.avatar, { backgroundColor: '#EBF5FB' }]}>
                  <Ionicons name="bicycle" size={24} color="#3498DB" />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.clientName}>{bag.entregador.nome}</Text>
                  <Text style={styles.courierVehicle}>
                    {bag.entregador.veiculo || 'Veículo não informado'}
                  </Text>
                </View>
                <View style={styles.courierActiveBadge}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.courierActiveText}>Em serviço</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.contactRow}>
                <TouchableOpacity style={styles.courierActionBtn} onPress={() => {/* ligação */ }}>
                  <Ionicons name="call" size={18} color="#FFF" />
                  <Text style={styles.courierActionText}>Ligar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.courierActionBtn, { backgroundColor: '#34495E' }]}
                  onPress={() => {/* chat */ }}
                >
                  <Ionicons name="chatbubbles" size={18} color="#FFF" />
                  <Text style={styles.courierActionText}>Mensagem</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {!bag.entregador && bag.status === 'AGUARDANDO_MOTO' && (
          <View style={styles.section}>
            <View style={styles.waitingCard}>
              <ActivityIndicator size="small" color="#9B59B6" />
              <Text style={styles.waitingText}>Procurando entregadores próximos...</Text>
            </View>
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        {bag.status === 'SOLICITADA' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.btnReject]}
              onPress={() => handleAction('RECUSAR')}
              disabled={submitting}
            >
              <Text style={styles.btnTextReject}>Recusar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.btnAccept]}
              onPress={() => handleAction('ACEITAR')}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Aceitar Mala</Text>}
            </TouchableOpacity>
          </>
        )}

        {bag.status === 'PREPARANDO' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.btnCourier]}
            onPress={handleRequestCourier}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.btnRow}>
                <Ionicons name="bicycle" size={22} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.btnText}>MALA PRONTA • CHAMAR MOTOBOY</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {showSearch && (
        <View style={styles.modalOverlay}>
          <View style={styles.searchModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sugerir Produto Extra</Text>
              <TouchableOpacity onPress={() => setShowSearch(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Nome do produto..."
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {isSearching ? (
                <ActivityIndicator style={{ marginTop: 20 }} color="#9B59B6" />
              ) : (
                Array.isArray(searchResults) && searchResults.map((prod: any) => (
                  prod.variacoes?.map((varItem: any) => (
                    <TouchableOpacity
                      key={varItem.id}
                      style={styles.searchResultItem}
                      onPress={() => handleAddExtra(varItem.id)}
                    >
                      <Text style={styles.searchResultName}>{prod.nome}</Text>
                      <Text style={styles.searchResultSub}>{varItem.tamanho} - {varItem.cor} (R$ {prod.preco})</Text>
                      <Ionicons name="add" size={20} color="#9B59B6" />
                    </TouchableOpacity>
                  ))
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  backButton: { padding: 8, backgroundColor: '#F1F3F5', borderRadius: 12 },
  headerTitleContainer: { marginLeft: 15, flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSubtitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold' },

  scrollContent: { padding: 20, paddingBottom: 120 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#ADB5BD', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },

  infoCard: { backgroundColor: '#fff', padding: 16, borderRadius: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },

  clientHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E9F7EF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#28a745', fontWeight: 'bold', fontSize: 20 },
  clientName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  clientDetail: { fontSize: 14, color: '#666' },
  divider: { height: 1, backgroundColor: '#F1F3F5', marginVertical: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center' },
  contactText: { marginLeft: 8, fontSize: 15, color: '#333', fontWeight: '500' },

  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  addressTextBold: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  addressText: { fontSize: 14, color: '#666' },

  itemRow: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 18, marginBottom: 12, alignItems: 'center', elevation: 2 },
  itemImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#F8F9FA' },
  itemInfo: { marginLeft: 15, flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  variationBadge: { backgroundColor: '#F1F3F5', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  variationText: { fontSize: 12, color: '#666', fontWeight: '500' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#28a745', marginTop: 6 },

  obsCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 18, borderLeftWidth: 4, borderLeftColor: '#28a745', elevation: 2 },
  obsText: { fontSize: 14, color: '#495057', fontStyle: 'italic', lineHeight: 20 },

  tokenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 20,
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#FFC107',
    marginTop: 10,
    elevation: 0,
  },
  tokenLabel: { fontSize: 12, color: '#856404', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 0.5 },
  tokenValue: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', letterSpacing: 4 },
  tokenHint: { fontSize: 12, color: '#856404', marginTop: 2 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F3F5', paddingBottom: 35 },
  actionButton: { flex: 1, height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8, elevation: 4 },
  btnReject: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FFC1C1' },
  btnAccept: { backgroundColor: '#28a745', shadowColor: '#28a745', shadowOpacity: 0.3 },
  btnCourier: { backgroundColor: '#007BFF', shadowColor: '#007BFF', shadowOpacity: 0.3 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  btnTextReject: { color: '#FF4D4D', fontWeight: 'bold', fontSize: 15 },
  btnRow: { flexDirection: 'row', alignItems: 'center' },

  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
    letterSpacing: 0.5,
  },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addSuggestionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5EEF8', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  addSuggestionText: { color: '#9B59B6', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },

  extraItemRow: { borderLeftWidth: 4, borderLeftColor: '#9B59B6' },
  extraBadge: { backgroundColor: '#9B59B6', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  extraBadgeText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },

  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 1000 },
  searchModal: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, minHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F5', borderRadius: 15, paddingHorizontal: 15, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
  searchResultName: { flex: 1, fontSize: 14, fontWeight: '600' },
  searchResultSub: { fontSize: 12, color: '#999', marginRight: 10 },

  courierCardHighlight: {
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  courierVehicle: {
    fontSize: 13,
    color: '#7F8C8D',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  courierActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF2F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3498DB',
    marginRight: 6,
  },
  courierActiveText: {
    fontSize: 10,
    color: '#3498DB',
    fontWeight: 'bold',
  },
  courierActionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#3498DB',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  courierActionText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 13,
  },
  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4ECF7',
    padding: 15,
    borderRadius: 15,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#9B59B6',
  },
  waitingText: {
    marginLeft: 10,
    color: '#9B59B6',
    fontWeight: '500',
    fontSize: 13,
  },
});