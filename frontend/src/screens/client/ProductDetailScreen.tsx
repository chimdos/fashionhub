import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useBag } from '../../contexts/BagContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const { addToBag, removeFromBag, isInBag } = useBag();

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [isStoreExpanded, setIsStoreExpanded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/products/${productId}`);
        const productData = response.data;
        if (productData.variacoes) {
          productData.variacoes = productData.variacoes.map((v: any) => ({
            ...v,
            produto: { nome: productData.nome, preco: productData.preco }
          }));
        }
        setProduct(productData);
      } catch (error) {
        console.error("Erro ao buscar detalhes do produto:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const toggleStoreExpansion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsStoreExpanded(!isStoreExpanded);
  };

  const handleBagAction = () => {
    if (!selectedVariation) {
      Alert.alert("Atenção", "Por favor, selecione um tamanho e cor.");
      return;
    }
    if (isInBag(selectedVariation.id)) {
      removeFromBag(selectedVariation.id);
      Alert.alert("Removido", `${product.nome} foi removido da sua mala.`);
    } else {
      addToBag(selectedVariation);
    }
  };

  const handleVariationPress = (variation: any) => {
    if (selectedVariation && selectedVariation.id === variation.id) {
      setSelectedVariation(null);
    } else {
      setSelectedVariation(variation);
    }
  };

  const getProductImage = () => {
    if (!product.imagens || product.imagens.length === 0) {
      return require('../../assets/placeholder.webp');
    }

    const img = product.imagens[0];
    return typeof img === 'string' ? { uri: img } : { uri: img.url };
  };

  if (isLoading || !product) {
    return (
      <View style={styles.centerContainer}>
        {isLoading ? <ActivityIndicator size="large" color="#555" /> : <Text>Produto não encontrado.</Text>}
      </View>
    );
  }

  const isVariationInBag = selectedVariation ? isInBag(selectedVariation.id) : false;

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.preco);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.imageHeader}>
          <Image source={getProductImage()} style={styles.mainImage} resizeMode="cover" />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContent}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{product.nome}</Text>
            <Text style={styles.productPrice}>{formattedPrice}</Text>
          </View>

          <View style={styles.storeSection}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={toggleStoreExpansion}
              style={styles.storeHeader}
            >
              <View style={styles.storeInfoRow}>
                <Ionicons name="business-outline" size={20} color="#5DADE2" />
                <Text style={styles.storeLabel}>Vendido por: </Text>
                {/* Ajustado para o nome real do campo: nome_loja */}
                <Text style={styles.storeName}>
                  {product.lojista?.nome_loja || 'FashionHub Prime'}
                </Text>
              </View>
              <Ionicons
                name={isStoreExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>

            {isStoreExpanded && (
              <View style={styles.storeDetailsLightWrapper}>
                <View style={styles.storeDetailsDarkWrapper}>
                  <View style={styles.storeDetailsCard}>
                    <Text style={styles.storeInfoText}>
                      <Text style={styles.bold}>Endereço: </Text>
                      {product.lojista?.rua}, {product.lojista?.numero} - {product.lojista?.bairro}
                    </Text>
                    <Text style={styles.storeInfoText}>
                      <Text style={styles.bold}>CEP: </Text>
                      {product.lojista?.cep}
                    </Text>
                    <Text style={styles.storeInfoText}>
                      <Text style={styles.bold}>Cidade: </Text>
                      {product.lojista?.cidade} / {product.lojista?.estado}
                    </Text>

                    <Text style={styles.storeInfoText}>
                      <Text style={styles.bold}>Contato: </Text>
                      {product.lojista?.user?.telefone || 'Consulte o chat'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.descriptionText}>{product.descricao}</Text>

          <Text style={styles.sectionTitle}>Selecione a Variação:</Text>
          <View style={styles.variationsGrid}>
            {product.variacoes.map((variation: any) => {
              const isSelected = selectedVariation?.id === variation.id;
              return (
                <View key={variation.id} style={styles.varLightWrapper}>
                  <View style={styles.varDarkWrapper}>
                    <TouchableOpacity
                      style={[styles.variationButton, isSelected && styles.variationButtonSelected]}
                      onPress={() => handleVariationPress(variation)}
                    >
                      <Text style={isSelected ? styles.variationTextSelected : styles.variationText}>
                        {`${variation.tamanho} - ${variation.cor}`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.btnLightWrapper}>
          <View style={[styles.btnDarkWrapper, isVariationInBag && styles.btnDarkRemove]}>
            <TouchableOpacity
              style={[styles.mainButton, isVariationInBag && styles.mainButtonRemove]}
              onPress={handleBagAction}
            >
              <Ionicons
                name={isVariationInBag ? "trash-outline" : "bag-handle-outline"}
                size={22}
                color={isVariationInBag ? "#FFF" : "#333"}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.buttonText, isVariationInBag && styles.buttonTextRemove]}>
                {isVariationInBag ? 'REMOVER DA MALA' : 'ADICIONAR À MALA'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBFCFD' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBFCFD' },

  imageHeader: { width: width, height: width * 1.1 },
  mainImage: { width: '100%', height: '100%' },
  backButton: {
    position: 'absolute', top: 50, left: 20,
    backgroundColor: '#FFF', padding: 10, borderRadius: 15,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 5
  },

  detailsContent: {
    backgroundColor: '#FBFCFD',
    marginTop: -35,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
    paddingBottom: 120,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  productName: { fontSize: 24, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
  productPrice: { fontSize: 22, fontWeight: '900', color: '#5DADE2' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 20, marginBottom: 15 },
  descriptionText: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 10 },

  variationsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  varLightWrapper: { borderRadius: 15, shadowColor: "#FFF", shadowOffset: { width: -3, height: -3 }, shadowOpacity: 1, shadowRadius: 5 },
  varDarkWrapper: { borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  variationButton: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#FFF', borderRadius: 15, borderWidth: 1, borderColor: '#F0F0F0' },
  variationButtonSelected: { backgroundColor: '#333', borderColor: '#333' },
  variationText: { color: '#555', fontWeight: '600' },
  variationTextSelected: { color: '#FFF', fontWeight: 'bold' },

  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 25, backgroundColor: 'rgba(251, 252, 253, 0.95)' },
  btnLightWrapper: { borderRadius: 25, shadowColor: "#FFF", shadowOffset: { width: -4, height: -4 }, shadowOpacity: 1, shadowRadius: 6 },
  btnDarkWrapper: { borderRadius: 25, shadowColor: "#4A9BCE", shadowOffset: { width: 4, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  btnDarkRemove: { shadowColor: "#E74C3C" },
  mainButton: { backgroundColor: '#5DADE2', height: 60, borderRadius: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  mainButtonRemove: { backgroundColor: '#E74C3C' },
  buttonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
  buttonTextRemove: { color: '#FFF' },

  storeSection: {
    marginBottom: 20,
    marginTop: 5,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeLabel: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  storeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5DADE2',
  },
  storeDetailsLightWrapper: {
    marginTop: 15,
    borderRadius: 20,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  storeDetailsDarkWrapper: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  storeDetailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F8F9FA',
  },
  storeInfoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
    lineHeight: 18,
  },
  bold: {
    fontWeight: 'bold',
    color: '#444',
  },
});