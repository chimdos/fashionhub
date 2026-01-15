import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';

const { width } = Dimensions.get('window');
const SCREEN_WIDTH = width;
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 40;

const BANNERS = [
  { id: '1', image: require('../../assets/banner1.png') },
  { id: '2', image: require('../../assets/banner2.png') },
  { id: '3', image: require('../../assets/banner3.png') },
];

export const PosterCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CAROUSEL_ITEM_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={BANNERS}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CAROUSEL_ITEM_WIDTH + 20}
        decelerationRate="fast"
        onScroll={onScroll}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <View style={styles.imageShadowContainer}>
              <Image 
                source={item.image} 
                style={styles.posterImage} 
                resizeMode="cover"
              />
            </View>
          </View>
        )}
      />

      <View style={styles.pagination}>
        {BANNERS.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.dot, 
              activeIndex === index ? styles.activeDot : styles.inactiveDot
            ]} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardWrapper: {
    width: CAROUSEL_ITEM_WIDTH,
    marginRight: 20,
  },
  imageShadowContainer: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  posterImage: {
    width: '100%',
    height: 180,
    borderRadius: 25,
  },

  pagination: {
    flexDirection: 'row',
    marginTop: -5,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#5DADE2',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#D1D1D1',
  },
});