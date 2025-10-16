import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

// O tipo 'any' é usado aqui para simplificar. O ideal seria criar uma interface Product.
interface ProductCarouselProps {
  products: any[];
}

export const ProductCarousel = ({ products }: ProductCarouselProps) => {
  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImagePlaceholder} />
      <Text style={styles.productName} numberOfLines={2}>{item.nome}</Text>
      <Text style={styles.productPrice}>R$ {item.preco}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20 }}
    />
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: 160,
    marginRight: 15,
  },
  productImagePlaceholder: {
    width: 160,
    height: 220,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});
