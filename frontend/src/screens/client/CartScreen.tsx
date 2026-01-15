import React, { useContext, useState } from 'react';
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
} from 'react-native';
import { useBag } from '../../contexts/BagContext';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons'

export const CartScreen = () => {
  const { items, itemCount, clearBag, removeFromBag } = useBag();
  const [isLoading, setIsLoading] = useState(false);

  const totalValue = items.reduce((acc, item) => acc + item.preco, 0);

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalValue);

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

    } catch (error: any) {
      console.error("Erro ao solicitar a mala:", error.response?.data || error);
      Alert.alert("Erro", "Não foi possível solicitar a sua mala. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.headerTitle}>Minha Mala</Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderBagItem}
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

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total estimado:</Text>
          <Text style={styles.totalValue}>{formattedTotal}</Text>
        </View>

        <View style={styles.btnLightWrapper}>
          <View style={styles.btnDarkWrapper}>
            <TouchableOpacity
              style={[styles.requestButton, (itemCount === 0 || isLoading) && styles.requestButtonDisabled]}
              onPress={handleRequestBag}
              disabled={itemCount === 0 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#333" />
              ) : (
                <Text style={styles.requestButtonText}>
                  SOLICITAR MALA ({itemCount})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBFCFD' },
  header: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 15 },
  logoText: { fontSize: 18, fontWeight: '900', color: '#5DADE2', marginBottom: 2 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  
  list: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },

  itemLightWrapper: {
    borderRadius: 20,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    marginBottom: 15,
  },
  itemDarkWrapper: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemVariation: { fontSize: 14, color: '#888', marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: '700', color: '#5DADE2', marginTop: 6 },
  
  removeButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBFCFD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#AAA', marginTop: 15, fontWeight: '500' },

  footer: { 
    padding: 25, 
    backgroundColor: 'rgba(251, 252, 253, 0.95)', 
    borderTopWidth: 1, 
    borderTopColor: '#F0F0F0',
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontSize: 16, color: '#666', fontWeight: '500' },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#333' },

  btnLightWrapper: { borderRadius: 25, shadowColor: "#FFF", shadowOffset: { width: -4, height: -4 }, shadowOpacity: 1, shadowRadius: 6 },
  btnDarkWrapper: { borderRadius: 25, shadowColor: "#4A9BCE", shadowOffset: { width: 4, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  requestButton: { backgroundColor: '#5DADE2', height: 60, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  requestButtonDisabled: { backgroundColor: '#A5D1EB' },
  requestButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});