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
} from 'react-native';
import { useBag } from '../../contexts/BagContext'; // Usando o hook personalizado
import api from '../../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Importa os ícones

export const CartScreen = () => {
  // --- ALTERAÇÃO 1: Pegamos a função 'removeFromBag' do contexto ---
  const { items, itemCount, clearBag, removeFromBag } = useBag();
  const [isLoading, setIsLoading] = useState(false); // Estado para o loading do botão

  const handleRequestBag = async () => {
    if (itemCount === 0) {
      Alert.alert("Atenção", "Sua mala está vazia. Adicione alguns itens primeiro!");
      return;
    }

    setIsLoading(true);

    try {
      const requestData = {
        // ATENÇÃO: O ID do endereço está fixo aqui apenas para teste.
        // Pegue um ID de endereço válido da sua tabela 'enderecos' no pgAdmin.
        endereco_entrega_id: "138f14a4-e4a8-4f71-a2dc-3d9a28445ae0", // Lembre-se de usar um ID real
        itens: items.map(item => ({
          variacao_produto_id: item.id,
          quantidade: 1 // Assumindo quantidade 1 por item
        }))
      };

      await api.post('/bags', requestData);

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
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.nome}</Text>
        <Text style={styles.itemVariation}>{`${item.tamanho} - ${item.cor}`}</Text>
        <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2)}</Text>
      </View>
      {/* --- ALTERAÇÃO 2: Adicionamos um botão de lixeira para remover o item --- */}
      <TouchableOpacity onPress={() => removeFromBag(item.id)}>
        <Ionicons name="trash-outline" size={24} color="#dc3545" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minha Mala</Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderBagItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Sua mala está vazia.</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.requestButton, (itemCount === 0 || isLoading) && styles.requestButtonDisabled]}
          onPress={handleRequestBag}
          disabled={itemCount === 0 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.requestButtonText}>Solicitar Mala ({itemCount} itens)</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5ff5f5' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  list: { padding: 20 },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  itemDetails: { flex: 1, marginRight: 10 },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemVariation: { fontSize: 14, color: 'gray', marginTop: 4 },
  itemPrice: { fontSize: 16, fontWeight: '500', marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 18, color: 'gray' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  requestButton: { height: 50, backgroundColor: '#007bff', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  requestButtonDisabled: { backgroundColor: '#a0c7e4' },
  requestButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});