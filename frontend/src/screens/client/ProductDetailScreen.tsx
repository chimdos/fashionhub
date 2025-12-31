import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useBag } from '../../contexts/BagContext';

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const { addToBag, removeFromBag, isInBag } = useBag();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);

  useEffect(() => {
    // ... (seu código de fetchProduct permanece o mesmo)
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

  const handleBagAction = () => {
    // ... (seu código handleBagAction permanece o mesmo)
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

  // --- ALTERAÇÃO PRINCIPAL AQUI ---
  // Nova função para lidar com a seleção e "des-seleção" da variação.
  const handleVariationPress = (variation: any) => {
    // Verifica se a variação clicada é a mesma que já está selecionada
    if (selectedVariation && selectedVariation.id === variation.id) {
      // Se for, limpa a seleção (define como null)
      setSelectedVariation(null);
    } else {
      // Se não for, seleciona a nova variação
      setSelectedVariation(variation);
    }
  };

  if (isLoading || !product) {
    return (
      <View style={styles.centerContainer}>
        {isLoading ? <ActivityIndicator size="large" color="#555" /> : <Text>Produto não encontrado.</Text>}
      </View>
    );
  }

  const isVariationInBag = selectedVariation ? isInBag(selectedVariation.id) : false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <ScrollView>
        <View style={styles.imageCarouselPlaceholder} />
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.nome}</Text>
          <Text style={styles.productPrice}>R$ {product.preco}</Text>
          <Text style={styles.productDescription}>{product.descricao}</Text>

          <Text style={styles.sectionTitle}>Selecione a Variação:</Text>
          <View style={styles.variationsContainer}>
            {product.variacoes.map((variation: any) => (
              <TouchableOpacity
                key={variation.id}
                style={[
                  styles.variationButton,
                  selectedVariation?.id === variation.id && styles.variationButtonSelected,
                ]}
                // O onPress agora chama a nossa nova função com a lógica de "toggle"
                onPress={() => handleVariationPress(variation)}
              >
                <Text style={selectedVariation?.id === variation.id ? styles.variationTextSelected : styles.variationText}>
                  {`${variation.tamanho} - ${variation.cor}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addToBagButton, isVariationInBag && styles.removeFromBagButton]}
          onPress={handleBagAction}
        >
          <Text style={styles.addToBagButtonText}>
            {isVariationInBag ? 'Remover da Mala' : 'Adicionar à Mala'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 1, backgroundColor: 'rgba(255,255,255,0.8)', padding: 8, borderRadius: 20 },
  imageCarouselPlaceholder: { height: 400, backgroundColor: '#f0f0f0' },
  detailsContainer: { padding: 20 },
  productName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  productPrice: { fontSize: 22, color: '#007bff', marginBottom: 16, fontWeight: '500' },
  productDescription: { fontSize: 16, color: '#666', lineHeight: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
  variationsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  variationButton: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#f0f0f0', borderRadius: 8, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  variationButtonSelected: { backgroundColor: '#333', borderColor: '#333' },
  variationText: { color: '#333' },
  variationTextSelected: { color: '#fff', fontWeight: 'bold' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  addToBagButton: { height: 50, backgroundColor: '#007bff', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  removeFromBagButton: { backgroundColor: '#dc3545' },
  addToBagButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});