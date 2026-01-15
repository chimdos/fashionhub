import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

import { ProductCarousel } from '../../components/client/ProductCarousel';
import { PosterCarousel } from '../../components/client/PosterCarousel';
import { CategoryButton } from '../../components/client/CategoryButton';

interface CategoryItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORIES_DATA: CategoryItem[] = [
  { id: '1', title: 'Camisas', icon: 'shirt-outline' },
  { id: '2', title: 'Calças', icon: 'ellipsis-horizontal' },
  { id: '3', title: 'Sapatos', icon: 'footsteps-outline' },
];

export const HomeScreen = ({ navigation }: any) => {
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
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

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Olá, bem-vindo!</Text>
            <Text style={styles.logoText}>FashionHub</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={26} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.inputShadowWrapper}>
            <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="O que você está procurando?"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
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

        <View style={styles.posterSection}>
          <PosterCarousel />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>Mais Vendidos</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#5DADE2" style={{ marginTop: 20 }} />
          ) : (
            <ProductCarousel
              products={bestSellingProducts}
              onProductPress={handleProductPress}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBFCFD',
  },
  container: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#5DADE2',
  },
  iconButton: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  inputShadowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },

  sectionContainer: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  seeAllText: {
    color: '#5DADE2',
    fontWeight: '600',
    fontSize: 14,
  },
  categoriesList: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  posterSection: {
    marginTop: 20,
  }
});