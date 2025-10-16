import React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import api from '../../services/api'; // Certifique-se de que este caminho está correto

const { width } = Dimensions.get('window');

// Dados de exemplo (mock) que podem ser substituídos por chamadas de API
const CATEGORIES_DATA = [
  { id: '1', title: 'Camisas' },
  { id: '2', title: 'Calças' },
  { id: '3', title: 'Sapatos' },
  { id: '4', title: 'Acessórios' },
  { id: '5', title: 'Casacos' },
];

const POSTERS_DATA = [
  { id: '1', imageUrl: 'https://placehold.co/350x180/EFEFEF/333?text=Anuncio+Lojista+1' },
  { id: '2', imageUrl: 'https://placehold.co/350x180/D3D3D3/555?text=Promoção+2' },
  { id: '3', imageUrl: 'https://placehold.co/350x180/C0C0C0/FFF?text=Coleção+Nova' },
];

export const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Função para buscar os produtos da API
    const fetchProducts = async () => {
      try {
        // Exemplo: buscando 6 produtos para a lista de "mais vendidos"
        const response = await api.get('/products?limit=6');
        setProducts(response.data.products);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Componente para renderizar cada botão de categoria
  const renderCategory = ({ item }: { item: { id: string, title: string } }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <Text style={styles.categoryText}>{item.title}</Text>
    </TouchableOpacity>
  );

  // Componente para renderizar cada poster no carrossel
  const renderPoster = ({ item }: { item: { id: string, imageUrl: string } }) => (
    <View style={styles.posterContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.posterImage} resizeMode="cover" />
    </View>
  );

  // Componente para renderizar cada produto na lista
  const renderProduct = ({ item }: any) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImagePlaceholder} />
      <Text style={styles.productName} numberOfLines={1}>{item.nome}</Text>
      <Text style={styles.productPrice}>R$ {item.preco}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. Secção de Categorias */}
        <Text style={styles.sectionTitle}>Categorias</Text>
        <FlatList
          data={CATEGORIES_DATA}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        {/* 2. Secção de Posters de Lojistas */}
        <FlatList
          data={POSTERS_DATA}
          renderItem={renderPoster}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled // Efeito de carrossel
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        {/* 3. Secção de Produtos Mais Vendidos */}
        <Text style={styles.sectionTitle}>Mais Vendidos em Camisas</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item: any) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos para a tela
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 5,
  },
  categoryItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontWeight: '500',
  },
  posterContainer: {
    width: width - 80, // Largura da tela menos as margens laterais
    height: 180,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  productCard: {
    width: 150,
    marginRight: 15,
  },
  productImagePlaceholder: {
    width: 150,
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
  },
});

