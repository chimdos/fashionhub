import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Interface para definir os tipos das props que o componente recebe.
 */
interface ProductCarouselProps {
  products: any[]; // A lista de produtos a ser exibida.
  onProductPress: (productId: string) => void; // A função a ser chamada quando um produto é clicado.
}

/**
 * Componente que renderiza um carrossel horizontal de produtos.
 */
export const ProductCarousel = ({ products, onProductPress }: ProductCarouselProps) => {
  
  /**
   * Função que define como cada item individual da lista de produtos deve ser renderizado.
   */
  const renderProduct = ({ item }: { item: any }) => (
    // O TouchableOpacity faz com que o card do produto seja "clicável".
    // Ao ser pressionado, ele chama a função 'onProductPress' que foi recebida via props,
    // passando o ID do produto específico que foi clicado.
    <TouchableOpacity style={styles.productCard} onPress={() => onProductPress(item.id)}>
      {/* Um placeholder visual para a imagem do produto */}
      <View style={styles.productImagePlaceholder} />
      {/* Exibe o nome do produto */}
      <Text style={styles.productName} numberOfLines={2}>{item.nome}</Text>
      {/* Exibe o preço do produto */}
      <Text style={styles.productPrice}>R$ {item.preco}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id.toString()}
      horizontal // Essencial para criar o carrossel horizontal
      showsHorizontalScrollIndicator={false} // Esconde a barra de rolagem
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
    />
  );
};

// Estilos para o componente
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

