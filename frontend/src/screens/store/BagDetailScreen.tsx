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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export const BagDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { bagId } = route.params;

  console.log("Debug: ID da mala recebido no detalhe:", bagId);

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
    let motivo = '';
    
    if (action === 'RECUSAR') {
      motivo = "Indisponibilidade de estoque no momento.";
    }

    setSubmitting(true);
    try {
      await api.post(`/api/bags/${bagId}/accept`, { action, motivo }); 
      
      Alert.alert("Sucesso", `A solicitação foi ${action === 'ACEITAR' ? 'aceita' : 'recusada'}.`);
      navigation.goBack();
    } catch (error: any) {
      console.error(error.response?.data);
      Alert.alert("Erro", error.response?.data?.message || "Falha ao processar ação.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.infoCard}>
            <Text style={styles.clientName}>{bag.cliente.nome}</Text>
            <Text style={styles.clientDetail}>{bag.cliente.email}</Text>
            <Text style={styles.clientDetail}>{bag.cliente.telefone}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
          <View style={styles.infoCard}>
            <Text style={styles.addressText}>
              {bag.endereco_entrega.logradouro}, {bag.endereco_entrega.numero}
            </Text>
            <Text style={styles.addressText}>
              {bag.endereco_entrega.bairro} - {bag.endereco_entrega.cidade}/{bag.endereco_entrega.estado}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens Solicitados ({bag.itens.length})</Text>
          {bag.itens.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <Image 
                source={{ uri: `${BASE_URL}${item.variacao_produto.produto.imagens[0]?.url_imagem}` }} 
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.variacao_produto.produto.nome}</Text>
                <Text style={styles.itemSub}>
                  Tam: {item.variacao_produto.tamanho} | Cor: {item.variacao_produto.cor}
                </Text>
                <Text style={styles.itemPrice}>R$ {Number(item.preco_unitario_mala).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {bag.observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações do Cliente</Text>
            <Text style={styles.obsText}>{bag.observacoes}</Text>
          </View>
        )}

      </ScrollView>

      {bag.status === 'SOLICITADA' && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.btnReject]} 
            onPress={() => handleAction('RECUSAR')}
            disabled={submitting}
          >
            <Text style={styles.btnText}>RECUSAR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.btnAccept]} 
            onPress={() => handleAction('ACEITAR')}
            disabled={submitting}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>ACEITAR MALA</Text>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 },
  infoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, elevation: 2 },
  clientName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  clientDetail: { fontSize: 14, color: '#666', marginTop: 2 },
  addressText: { fontSize: 15, color: '#444' },
  itemRow: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  itemInfo: { marginLeft: 12, flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600' },
  itemSub: { fontSize: 12, color: '#888' },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#28a745', marginTop: 2 },
  obsText: { fontStyle: 'italic', color: '#555', backgroundColor: '#fff', padding: 15, borderRadius: 12 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  actionButton: { flex: 1, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  btnReject: { backgroundColor: '#dc3545' },
  btnAccept: { backgroundColor: '#28a745' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});