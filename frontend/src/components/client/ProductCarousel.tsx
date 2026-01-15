import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.48;

interface ProductCarouselProps {
  products: any[];
  onProductPress: (id: string) => void;
}

export const ProductCarousel = ({ products, onProductPress }: ProductCarouselProps) => {

  const renderProductCard = ({ item }: any) => {

    const imageUrl = item.imagens && item.imagens.length > 0
      ? { uri: item.imagens[0] }
      : require('../../assets/placeholder.webp');

    const formattedPrice = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(item.preco || 0);

    return (
      <View style={styles.cardLightWrapper}>
        <View style={styles.cardDarkWrapper}>
          <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => onProductPress(item.id)}
          >
            <View style={styles.imageContainer}>
              <Image source={imageUrl} style={styles.productImage} resizeMode="cover" />
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.productTitle} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.productPrice}>{formattedPrice}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={products}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderProductCard}
      contentContainerStyle={styles.listContent}
      snapToInterval={CARD_WIDTH + 20}
      decelerationRate="fast"
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH - 24,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    paddingHorizontal: 5,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#5DADE2',
  },
  cardLightWrapper: {
    marginHorizontal: 8,
    borderRadius: 24,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: -1.5, height: -1.5 },
    shadowOpacity: 1,
    shadowRadius: 3,
    marginBottom: 15,
  },
  cardDarkWrapper: {
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
});