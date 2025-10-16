import React from 'react';
import { View, FlatList, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const POSTERS_DATA = [
  { id: '1', imageUrl: 'https://placehold.co/400x200/e0e0e0/333?text=Poster+Exemplo+1' },
  { id: '2', imageUrl: 'https://placehold.co/400x200/d4d4d4/555?text=Poster+Exemplo+2' },
  { id: '3', imageUrl: 'https://placehold.co/400x200/c8c8c8/777?text=Poster+Exemplo+3' },
];

export const PosterCarousel = () => {
  const renderPoster = ({ item }: { item: { id: string, imageUrl: string } }) => (
    <View style={styles.posterContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.posterImage} resizeMode="cover" />
    </View>
  );

  return (
    <FlatList
      data={POSTERS_DATA}
      renderItem={renderPoster}
      keyExtractor={(item) => item.id}
      horizontal
      pagingEnabled // Cria o efeito de "snap" do carrossel
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20 }}
    />
  );
};

const styles = StyleSheet.create({
  posterContainer: {
    width: width - 40, // Largura total menos o espaçamento lateral
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
});
