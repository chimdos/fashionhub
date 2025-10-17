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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

// As props 'route' e 'navigation' são passadas automaticamente pelo React Navigation
export const ProductDetailScreen = ({ route, navigation }: any) => {
  // Pega o ID do produto que foi passado como parâmetro na navegação
  const { productId } = route.params;

  // Estados para guardar os dados do produto, o estado de carregamento e a variação selecionada
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);

  // useEffect é executado quando o componente é montado
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Faz uma chamada GET para a API para buscar os detalhes do produto
        const response = await api.get(`/products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Erro ao buscar detalhes do produto:", error);
        Alert.alert("Erro", "Não foi possível carregar os detalhes do produto.");
      } finally {
        setIsLoading(false); // Termina o carregamento
      }
    };

    fetchProduct();
  }, [productId]); // A busca é refeita se o productId mudar

  // Função para lidar com o clique no botão "Adicionar à Mala"
  const handleAddToBag = () => {
    if (!selectedVariation) {
      Alert.alert("Atenção", "Por favor, selecione um tamanho e cor.");
      return;
    }
    // Lógica para adicionar ao BagContext (será implementada na Fase 2)
    console.log("Adicionar à mala:", selectedVariation);
    Alert.alert("Sucesso", `${product.nome} (${selectedVariation.tamanho} - ${selectedVariation.cor}) foi adicionado à sua mala!`);
  };

  // Se ainda estiver a carregar, mostra um indicador de atividade
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#555" />
      </View>
    );
  }

  // Se o produto não for encontrado, mostra uma mensagem de erro
  if (!product) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text>Produto não encontrado.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{color: '#007bff', marginTop: 10}}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Botão para voltar para a tela anterior */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <ScrollView>
        {/* Placeholder para o carrossel de imagens do produto */}
        <View style={styles.imageCarouselPlaceholder} />

        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.nome}</Text>
          <Text style={styles.productPrice}>R$ {product.preco}</Text>
          <Text style={styles.productDescription}>{product.descricao}</Text>

          {/* Seção para selecionar as variações */}
          <Text style={styles.sectionTitle}>Selecione o Tamanho e a Cor:</Text>
          <View style={styles.variationsContainer}>
            {product.variacoes && product.variacoes.map((variation: any) => (
              <TouchableOpacity
                key={variation.id}
                style={[
                  styles.variationButton,
                  selectedVariation?.id === variation.id && styles.variationButtonSelected,
                ]}
                onPress={() => setSelectedVariation(variation)}
              >
                <Text style={selectedVariation?.id === variation.id && styles.variationTextSelected}>
                  {`${variation.tamanho} - ${variation.cor}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Botão fixo na parte inferior da tela */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToBagButton} onPress={handleAddToBag}>
          <Text style={styles.addToBagButtonText}>Adicionar à Mala</Text>
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
  variationButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  variationButtonSelected: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  variationTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  addToBagButton: {
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToBagButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

