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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export const ProductManagementScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStoreProducts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/products/store/my-products');
      setProducts(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos da loja:", error);
      Alert.alert("Erro", "Não foi possível carregar seus produtos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchStoreProducts();
    });
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (productId: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Deletar", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/api/products/${productId}`);
              Alert.alert("Sucesso", "Produto deletado.");
              fetchStoreProducts();
            } catch (error: any) {
              console.error("Erro ao deletar produto:", error.response?.data || error);
              Alert.alert("Erro", error.response?.data?.message || "Não foi possível deletar o produto.");
            }
          }
        }
      ]
    );
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <View style={styles.productImagePlaceholder} /> 
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.nome}</Text>
        <Text style={styles.productPrice}>R$ {item.preco}</Text>
        <Text style={item.ativo ? styles.productStatusActive : styles.productStatusInactive}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity onPress={() => navigation.navigate('EditProduct', { productId: item.id })}>
          <Ionicons name="pencil" size={24} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Produtos</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate('CreateProduct')}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#555" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não cadastrou nenhum produto.</Text>}
        />
      )}
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
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 20,
  },
  list: { padding: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
  },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productPrice: { fontSize: 14, color: 'gray', marginTop: 4 },
  productStatusActive: { fontSize: 14, color: '#28a745', fontWeight: 'bold', marginTop: 4 },
  productStatusInactive: { fontSize: 14, color: '#dc3545', fontWeight: 'bold', marginTop: 4 },
  productActions: {
    flexDirection: 'row',
  },
});