import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export const BagDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { bagId } = route.params;

  const [bag, setBag] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const BASE_URL = api.defaults.baseURL;

  useEffect(() => {
    fetchBagDetails();
  }, [bagId]);

  const fetchBagDetails = async () => {
    try {
      const response = await api.get(`/api/bags/${bagId}`);
      setBag(response.data);
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível carregar os detalhes da mala.");
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

      Alert.alert("Sucesso", `A solicitação foi ${action === 'ACEITAR' ? 'aceita' : 'recusada'}.`);
      await fetchBagDetails();
    } catch (error: any) {
      Alert.alert("Erro", error.response?.data?.message || "Falha ao processar ação.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestCourier = async () => {
    setSubmitting(true);
    try {
      await api.post(`/api/bags/${bagId}/request-courier`);
      Alert.alert("Sucesso", "Solicitação de entregador enviada!");
      await fetchBagDetails();
    } catch (error: any) {
      Alert.alert("Erro", error.response?.data?.message || "Falha ao solicitar entregador.");
    } finally {
      setSubmitting(false);
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SOLICITADA': return { color: '#E67E22', bg: '#FDEBD0', label: 'Pendente' };
      case 'PREPARANDO': return { color: '#3498DB', bg: '#EBF5FB', label: 'Em Preparo' };
      case 'AGUARDANDO_MOTO': return { color: '#9B59B6', bg: '#F5EEF8', label: 'Aguardando Coleta' };
      case 'ENTREGUE': return { color: '#28a745', bg: '#E9F7EF', label: 'Finalizado' };
      default: return { color: '#7F8C8D', bg: '#F2F4F4', label: status };
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  const statusStyle = getStatusStyle(bag.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>Mala #{bag.id.substring(0, 6).toUpperCase()}</Text>
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
          <Text style={styles.sectionTitle}>Itens na Mala ({bag.itens.length})</Text>
          {bag.itens.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <Image
                source={{ uri: `${BASE_URL}${item.variacao_produto.produto.imagens[0]?.url_imagem}` }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.variacao_produto.produto.nome}</Text>
                <View style={styles.variationBadge}>
                  <Text style={styles.variationText}>
                    {item.variacao_produto.tamanho} • {item.variacao_produto.cor}
                  </Text>
                </View>
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
});