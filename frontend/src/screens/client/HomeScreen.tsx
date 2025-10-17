import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import api from '../../services/api';

// Importando os componentes
import { ProductCarousel } from '../../components/client/ProductCarousel';
import { PosterCarousel } from '../../components/client/PosterCarousel';
import { CategoryButton } from '../../components/client/CategoryButton';

const CATEGORIES_DATA = [
  { id: '1', title: 'Camisas', icon: 'shirt-outline' },
  { id: '2', title: 'Calças', icon: 'ellipsis-horizontal' },
  { id: '3', title: 'Sapatos', icon: 'footsteps-outline' },
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
    // --- PISTA DE DIAGNÓSTICO ---
    // Esta linha irá imprimir no terminal do Metro as rotas que este navegador conhece.
    try {
      console.log('Rotas disponíveis neste navegador:', navigation.getState().routeNames);
    } catch (e) {
      console.log("Não foi possível obter o estado do navegador. O objeto 'navigation' pode não ser o esperado.");
    }

    navigation.navigate('ProductDetail', { productId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
            {CATEGORIES_DATA.map(item => (
              <CategoryButton
                key={item.id}
                iconName={item.icon}
                label={item.title}
                onPress={() => console.log(`Categoria: ${item.title}`)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <PosterCarousel />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mais Vendidos em Camisas</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#555" style={{ marginTop: 20 }}/>
          ) : (
            <ProductCarousel
              products={bestSellingProducts}
              onProductPress={handleProductPress}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
});