import React, { useState, useEffect } from 'react';
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
import api from '../../services/api';
// --- CORREÇÃO 1: O caminho foi ajustado para 'client' ---
import { ProductCarousel } from '../../components/cliente/ProductCarousel';

const { width } = Dimensions.get('window');

// Dados de exemplo (mock)
const CATEGORIES_DATA = [
  { id: '1', title: 'Camisas' },
  { id: '2', title: 'Calças' },
  { id: '3', title: 'Sapatos' },
];
const POSTERS_DATA = [
  { id: '1', imageUrl: 'https://placehold.co/350x180/EFEFEF/333?text=Anuncio+1' },
  { id: '2', imageUrl: 'https://placehold.co/350x180/D3D3D3/555?text=Anuncio+2' },
];

export const HomeScreen = ({ navigation }: any) => {
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await api.get('/products?limit=6');
        setBestSellingProducts(response.data.products);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  // Funções para renderizar as outras listas
  const renderCategory = ({ item }: { item: { id: string, title: string } }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <Text style={styles.categoryText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderPoster = ({ item }: { item: { id: string, imageUrl: string } }) => (
    <View style={styles.posterContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.posterImage} resizeMode="cover" />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Categorias</Text>
        <FlatList
          data={CATEGORIES_DATA}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        <FlatList
          data={POSTERS_DATA}
          renderItem={renderPoster}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        <Text style={styles.sectionTitle}>Mais Vendidos em Camisas</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#555" />
        ) : (
          // --- CORREÇÃO 2: Usamos o componente ProductCarousel aqui ---
          // A função 'renderProduct' e a 'FlatList' para produtos foram removidas
          // e substituídas pelo nosso componente reutilizável.
          <ProductCarousel
            products={bestSellingProducts}
            onProductPress={handleProductPress}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Seus estilos permanecem os mesmos
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  listContainer: { paddingHorizontal: 20, paddingVertical: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 20, marginTop: 20, marginBottom: 5 },
  categoryItem: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#f0f0f0', borderRadius: 20, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  categoryText: { fontWeight: '500' },
  posterContainer: { width: width - 80, height: 180, marginRight: 15, borderRadius: 10, overflow: 'hidden', backgroundColor: '#f0f0f0' },
  posterImage: { width: '100%', height: '100%' },
});

