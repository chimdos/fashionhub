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

// --- ATENÇÃO AQUI: Importando os componentes das pastas corretas ---
// Usando 'cliente' no caminho, como na sua estrutura de pastas.
import { ProductCarousel } from '../../components/client/ProductCarousel';
import { PosterCarousel } from '../../components/client/PosterCarousel';
import { CategoryButton } from '../../components/client/CategoryButton';

// Dados de exemplo para as categorias
const CATEGORIES_DATA = [
  { id: '1', title: 'Camisas', icon: 'shirt-outline' },
  { id: '2', title: 'Calças', icon: 'ellipsis-horizontal' }, // Ícone genérico
  { id: '3', title: 'Sapatos', icon: 'footsteps-outline' },
];

/**
 * A tela inicial principal para o cliente.
 * Ela recebe a prop 'navigation' do HomeStackNavigator.
 */
export const HomeScreen = ({ navigation }: any) => {
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Busca os produtos da API quando a tela é carregada
    const fetchBestSellers = async () => {
      try {
        const response = await api.get('/api/products?limit=6');
        setBestSellingProducts(response.data.products);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  /**
   * Função que é chamada quando um produto é clicado.
   * Ela usa o objeto 'navigation' para navegar para a tela de detalhes.
   */
  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Seção de Categorias */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }}>
            {/* Agora usamos o componente CategoryButton aqui */}
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

        {/* Seção de Posters */}
        <View style={styles.sectionContainer}>
          {/* Usamos o componente PosterCarousel */}
          <PosterCarousel />
        </View>

        {/* Seção de Produtos Mais Vendidos */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mais Vendidos em Camisas</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#555" style={{ marginTop: 20 }}/>
          ) : (
            // A HomeScreen agora USA o componente ProductCarousel,
            // passando a lista de produtos e a função de clique para ele.
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

// Estilos para a tela
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
