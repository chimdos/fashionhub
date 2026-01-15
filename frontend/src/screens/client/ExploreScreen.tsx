import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const SCREEN_PADDING = 20;
const COLUMN_GAP = 15;
const COLUMN_WIDTH = (width - (SCREEN_PADDING * 2) - COLUMN_GAP) / 2;

export const ExploreScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const TRENDING_TAGS = ['Tudo', 'Malas', 'Roupas', 'Acessórios', 'Ofertas'];

  useEffect(() => {
    const fetchExploreProducts = async () => {
      try {
        const response = await api.get('/api/products');
        setProducts(response.data.products || response.data);
      } catch (error) {
        console.error("Erro ao explorar produtos:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExploreProducts();
  }, []);

  const getSafeImage = (item: any) => {
    if (!item?.imagens || item.imagens.length === 0) return require('../../assets/placeholder.webp');
    const img = item.imagens[0];
    return typeof img === 'string' ? { uri: img } : { uri: img.url };
  };

  const renderProductItem = ({ item }: any) => {
    const priceValue = item.preco || 0;

    const formattedPrice = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(priceValue);

    return (
      <View style={styles.cardLightWrapper}>
        <View style={styles.cardDarkWrapper}>
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          >
            <Image source={getSafeImage(item)} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.productPrice}>{formattedPrice}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorar</Text>

        <View style={styles.searchLightWrapper}>
          <View style={styles.searchDarkWrapper}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#888" />
              <TextInput
                placeholder="Buscar produtos, marcas..."
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
        >
          {TRENDING_TAGS.map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Destaques da Semana</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#5DADE2" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.columnWrapper}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBFCFD' },
  header: { paddingHorizontal: 25, paddingTop: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20 },

  searchLightWrapper: { borderRadius: 20, shadowColor: "#FFF", shadowOffset: { width: -3, height: -3 }, shadowOpacity: 1, shadowRadius: 5 },
  searchDarkWrapper: { borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#F0F0F0'
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333' },

  tagsContainer: { paddingLeft: 25, paddingVertical: 20 },
  tagPill: {
    backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginRight: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4,
    borderWidth: 1, borderColor: '#F0F0F0'
  },
  tagText: { fontWeight: '600', color: '#5DADE2', fontSize: 13 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 25, marginBottom: 15 },
  gridContainer: { paddingHorizontal: SCREEN_PADDING, paddingBottom: 30 },

  cardLightWrapper: {
    width: COLUMN_WIDTH, borderRadius: 20,
    shadowColor: "#FFF", shadowOffset: { width: -2, height: -2 }, shadowOpacity: 1, shadowRadius: 3, marginVertical: 10,
  },
  cardDarkWrapper: {
    borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 2, height: 3 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3
  },
  productCard: { backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#F5F5F5' },
  productImage: { width: '100%', height: COLUMN_WIDTH, backgroundColor: '#F8F9FA' },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 4 },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: '#5DADE2' },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 5,
  },
});