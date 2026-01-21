import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

export const EditProductScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estoqueGeral, setEstoqueGeral] = useState('');

  const [images, setImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<any[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  const [variacoes, setVariacoes] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const categorias = ['Masculino', 'Feminino', 'Camisa', 'Calçado', 'Acessórios'];

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/products/${productId}`);
      const p = response.data;

      setNome(p.nome);
      setDescricao(p.descricao);
      setPreco(p.preco?.toString().replace('.', ',') || '0');
      setCategoria(p.categoria);
      setEstoqueGeral(p.estoque?.toString() || '0');
      setImages(p.imagens || []);
      setVariacoes(p.variacoes || []);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar produto.");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewImages([...newImages, result.assets[0]]);
    }
  };

  const removeExistingImage = (id: string) => {
    setDeletedImageIds([...deletedImageIds, id]);
    setImages(images.filter(img => img.id !== id));
  };

  const removeNewImage = (uri: string) => {
    setNewImages(newImages.filter(img => img.uri !== uri));
  };

  const addVariation = () => {
    setVariacoes([...variacoes, { tamanho: '', cor: '', estoque: 0 }]);
  };

  const updateVariation = (index: number, field: string, value: string) => {
    const newVars = [...variacoes];
    if (field === 'estoque') {
      newVars[index][field] = parseInt(value) || 0;
    } else {
      newVars[index][field] = value;
    }
    setVariacoes(newVars);
  };

  const removeVariation = (index: number) => {
    const newVars = variacoes.filter((_, i) => i !== index);
    setVariacoes(newVars);
  };

  const handleUpdateProduct = async () => {
    setIsSaving(true);
    try {
      const precoLimpo = parseFloat(preco.replace(/\./g, '').replace(',', '.'));

      const payload = {
        nome,
        descricao,
        preco: precoLimpo,
        categoria,
        estoque: parseInt(estoqueGeral) || 0,
        variacoes,
        deletedImageIds
      };

      await api.put(`/api/products/${productId}`, payload);

      Alert.alert("Sucesso", "Produto e variações atualizados!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <View style={styles.loading}><ActivityIndicator size="large" color="#28a745" /></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#333" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Produto</Text>
          <TouchableOpacity onPress={handleUpdateProduct} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#28a745" /> : <Text style={styles.saveHeaderBtn}>Salvar</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.container}>

          <Text style={styles.sectionTitle}>Fotos do Produto</Text>
          <View style={styles.imageGrid}>
            {images.map((img) => (
              <View key={img.id} style={styles.imageWrapper}>
                <Image source={{ uri: img.url }} style={styles.productImage} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeExistingImage(img.id)}>
                  <Ionicons name="close-circle" size={24} color="#FF4D4D" />
                </TouchableOpacity>
              </View>
            ))}
            {newImages.map((img, idx) => (
              <View key={idx} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={styles.productImage} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeNewImage(img.uri)}>
                  <Ionicons name="close-circle" size={24} color="#FF4D4D" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
              <Ionicons name="camera-outline" size={30} color="#28a745" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>NOME DO PRODUTO</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={nome} onChangeText={setNome} />
            </View>

            <Text style={styles.label}>CATEGORIA</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => setShowCategoryMenu(!showCategoryMenu)}
            >
              <Text style={{ color: categoria ? '#333' : '#ADB5BD' }}>
                {categoria || "Selecione uma categoria"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {showCategoryMenu && (
              <View style={styles.dropdown}>
                {categorias.map((cat) => (
                  <TouchableOpacity key={cat} style={styles.dropdownItem} onPress={() => { setCategoria(cat); setShowCategoryMenu(false); }}>
                    <Text style={styles.dropdownText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>PREÇO (R$)</Text>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} value={preco} onChangeText={setPreco} keyboardType="numeric" />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>ESTOQUE GERAL</Text>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} value={estoqueGeral} onChangeText={setEstoqueGeral} keyboardType="numeric" />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={styles.sectionTitle}>Variações (Tamanho/Cor)</Text>
              <TouchableOpacity onPress={addVariation}><Ionicons name="add-circle" size={28} color="#28a745" /></TouchableOpacity>
            </View>

            {variacoes.map((v, index) => (
              <View key={index} style={styles.variationRow}>
                <TextInput
                  style={styles.variationInput}
                  placeholder="Tamanho"
                  value={v.tamanho}
                  onChangeText={(t) => updateVariation(index, 'tamanho', t)}
                />
                <TextInput
                  style={styles.variationInput}
                  placeholder="Cor"
                  value={v.cor}
                  onChangeText={(t) => updateVariation(index, 'cor', t)}
                />
                <TextInput
                  style={[styles.variationInput, { flex: 0.6 }]}
                  placeholder="Qtd"
                  keyboardType="numeric"
                  value={v.estoque?.toString() || '0'}
                  onChangeText={(t) => updateVariation(index, 'estoque', t)}
                />
                <TouchableOpacity onPress={() => removeVariation(index)}>
                  <Ionicons name="trash-outline" size={22} color="#FF4D4D" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProduct} disabled={isSaving}>
            <Text style={styles.saveButtonText}>Confirmar Alterações</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  container: { padding: 20 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ADB5BD',
    marginBottom: 8,
    letterSpacing: 1
  },

  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10
  },
  imageWrapper: {
    width: 80,
    height: 80,
    marginRight: 12,
    marginBottom: 12,
    borderRadius: 12,
    position: 'relative'
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#F1F3F5'
  },
  removeImageBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4D4D',
    borderRadius: 10,
    elevation: 2
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#28a745',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FFF4'
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 55
  },
  pickerContainer: {
    backgroundColor: '#F1F3F5',
    borderRadius: 12,
    marginBottom: 20,
    height: 55,
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  input: { flex: 1, fontSize: 16, color: '#333' },
  textAreaContainer: { height: 100, alignItems: 'flex-start', paddingTop: 10 },
  icon: { marginRight: 10 },

  variationHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 5
  },
  variationHeaderText: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ADB5BD',
    textAlign: 'center'
  },
  variationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  variationInput: {
    flex: 1,
    height: 45,
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    marginHorizontal: 4,
    textAlign: 'center',
    fontSize: 14,
    color: '#333'
  },
  removeVariationBtn: { padding: 5 },
  addVariationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF'
  },
  addVariationText: { color: '#28a745', fontWeight: 'bold', marginLeft: 8 },

  saveButton: {
    backgroundColor: '#28a745',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#28a745',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginTop: 10
  },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  discardButton: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 40
  },
  discardButtonText: { color: '#ADB5BD', fontWeight: '600' },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  saveHeaderBtn: {
    color: '#28a745',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 5,
  },
  dropdown: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: -15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});