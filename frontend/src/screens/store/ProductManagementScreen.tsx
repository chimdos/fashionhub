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
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';

export const ProductManagementScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const BASE_URL = api.defaults.baseURL;

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
      "Excluir Produto",
      "Tem certeza que deseja deletar este produto? Esta ação removerá o item da vitrine dos clientes.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/products/${productId}`);
              Alert.alert("Sucesso", "Produto removido com sucesso.");
              fetchStoreProducts();
            } catch (error: any) {
              Alert.alert("Erro", error.response?.data?.message || "Não foi possível deletar.");
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStoreProducts();
    setRefreshing(false);
  }

  const renderProductItem = ({ item }: { item: any }) => {
    const imageUrl = item.imagens && item.imagens.length > 0
      ? `${BASE_URL}${item.imagens[0].url_imagem}`
      : null;

    return (
      <View style={styles.productCard}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={30} color="#CCC" />
          </View>
        )}

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.nome}</Text>
          <Text style={styles.productPrice}>R$ {Number(item.preco).toFixed(2)}</Text>

          <View style={[styles.statusBadge, { backgroundColor: item.ativo ? '#E9F7EF' : '#FEEFF0' }]}>
            <View style={[styles.statusDot, { backgroundColor: item.ativo ? '#28a745' : '#FF4D4D' }]} />
            <Text style={[styles.statusText, { color: item.ativo ? '#28a745' : '#FF4D4D' }]}>
              {item.ativo ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
          >
            <Ionicons name="pencil-outline" size={20} color="#28a745" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { marginLeft: 10 }]}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Gerenciamento</Text>
          <Text style={styles.headerTitle}>Meus Produtos</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateProduct')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.loadingText}>Carregando seu catálogo...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item: any) => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={[styles.list, products.length === 0 && { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="shirt-outline"
              title="Nenhum produto ainda"
              description="Toque no botão '+' acima ou no botão abaixo para cadastrar sua primeira peça no catálogo."
              buttonText="Cadastrar Produto"
              onPress={() => navigation.navigate('CreateProduct')}
            />
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
    paddingBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  headerSubtitle: { fontSize: 14, color: '#666', fontWeight: '500' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
  addButton: {
    backgroundColor: '#28a745',
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666', fontSize: 14 },

  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  productImage: {
    width: 75,
    height: 75,
    borderRadius: 15,
    backgroundColor: '#F1F3F5',
  },
  imagePlaceholder: {
    width: 75,
    height: 75,
    borderRadius: 15,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
  },
  productName: { fontSize: 17, fontWeight: 'bold', color: '#1A1A1A' },
  productPrice: { fontSize: 15, color: '#666', marginTop: 2, fontWeight: '500' },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },

  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
});