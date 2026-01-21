import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const CATEGORIAS_FIXAS = [
  { label: 'Selecione uma categoria...', value: '' },
  { label: 'Camisa', value: 'Camisa' },
  { label: 'Calça', value: 'Calça' },
  { label: 'Calçado', value: 'Calçado' },
  { label: 'Boné', value: 'Boné' },
];

interface VariationState {
  id: string;
  cor: string;
  tamanho: string;
  estoque: string;
  preco: string;
}

export const CreateProductScreen = ({ navigation }: any) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [variacoes, setVariacoes] = useState<VariationState[]>([]);

  const handleSelectImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão negada", "Precisamos de permissão para acessar suas fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  const handleCreateProduct = async () => {
    if (!nome || !descricao || !preco || !categoria) {
      Alert.alert("Atenção", "Preencha os campos básicos do produto.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('descricao', descricao);
      formData.append('preco', preco);
      formData.append('categoria', categoria);

      const variationsPayload = variacoes.map(item => ({
        cor: item.cor,
        tamanho: item.tamanho,
        quantidade_estoque: parseInt(item.estoque) || 0,
        preco: item.preco ? parseFloat(item.preco) : null
      }));
      formData.append('variacoes', JSON.stringify(variationsPayload));

      images.forEach((img, index) => {
        const uri = img.uri;
        const fileType = uri.split('.').pop();
        formData.append('imagens', {
          uri: uri,
          name: `produto_${index}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      });

      await api.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert("Sucesso", "Seu produto já está na vitrine!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível criar o produto.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVariation = () => {
    setVariacoes([...variacoes, { id: Date.now().toString(), cor: '', tamanho: '', estoque: '', preco: '' }]);
  };

  const handleUpdateVariation = (id: string, field: keyof VariationState, value: string) => {
    setVariacoes(variacoes.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const formatCurrency = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");

    const numberValue = Number(cleanValue) / 100;

    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Produto</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Ionicons name="pricetag-outline" size={20} color="#28a745" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Nome do Produto" value={nome} onChangeText={setNome} />
            </View>

            <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 15 }]}>
              <Ionicons name="document-text-outline" size={20} color="#28a745" style={styles.icon} />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Descrição..."
                value={descricao}
                onChangeText={setDescricao}
                multiline
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <Ionicons name="cash-outline" size={20} color="#28a745" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="0,00"
                  value={preco}
                  onChangeText={(text) => {
                    const formatted = formatCurrency(text);
                    setPreco(formatted);
                  }}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.pickerWrapper, { flex: 1.2 }]}>
                <Picker
                  selectedValue={categoria}
                  onValueChange={(val) => setCategoria(val)}
                  style={styles.picker}
                >
                  {CATEGORIAS_FIXAS.map(cat => <Picker.Item key={cat.value} label={cat.label} value={cat.value} />)}
                </Picker>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Imagens (Até 5)</Text>
          <TouchableOpacity style={styles.imageButton} onPress={handleSelectImages}>
            <Ionicons name="cloud-upload-outline" size={28} color="#28a745" />
            <Text style={styles.imageButtonText}>Selecionar Fotos</Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewList}>
            {images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImage} onPress={() => setImages(images.filter((_, i) => i !== index))}>
                  <Ionicons name="close-circle" size={20} color="#FF4D4D" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.variationHeader}>
            <Text style={styles.sectionTitle}>Variações e Estoque</Text>
            <TouchableOpacity onPress={handleAddVariation} style={styles.addVariationBtn}>
              <Ionicons name="add-circle" size={20} color="#28a745" />
              <Text style={styles.addVariationText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {variacoes.map((item, index) => (
            <View key={item.id} style={styles.variationCard}>
              <View style={styles.varTitleRow}>
                <Text style={styles.varLabel}>Opção #{index + 1}</Text>
                <TouchableOpacity onPress={() => setVariacoes(variacoes.filter(v => v.id !== item.id))}>
                  <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.smallInput, { flex: 2 }]}
                  placeholder="Cor (ex: Azul)"
                  value={item.cor}
                  onChangeText={(t) => handleUpdateVariation(item.id, 'cor', t)}
                />
                <TextInput
                  style={[styles.smallInput, { flex: 1 }]}
                  placeholder="Tam"
                  value={item.tamanho}
                  onChangeText={(t) => handleUpdateVariation(item.id, 'tamanho', t)}
                />
                <TextInput
                  style={[styles.smallInput, { flex: 1 }]}
                  placeholder="Qtd"
                  keyboardType="numeric"
                  value={item.estoque}
                  onChangeText={(t) => handleUpdateVariation(item.id, 'estoque', t)}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveButton, isLoading && { backgroundColor: '#A3D9B1' }]}
            onPress={handleCreateProduct}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Publicar Produto</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', elevation: 2 },
  backButton: { padding: 8, backgroundColor: '#F1F3F5', borderRadius: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },

  scrollContainer: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#ADB5BD', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },

  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F5', borderRadius: 12, marginBottom: 12, paddingHorizontal: 12, height: 55 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerWrapper: { backgroundColor: '#F1F3F5', borderRadius: 12, height: 55, justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  picker: { width: '100%', color: '#333' },

  imageButton: { height: 80, borderStyle: 'dashed', borderWidth: 2, borderColor: '#28a745', borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E9F7EF', marginBottom: 15 },
  imageButtonText: { marginTop: 5, color: '#28a745', fontWeight: 'bold' },
  imagePreviewList: { marginBottom: 20 },
  imageWrapper: { marginRight: 12, position: 'relative' },
  imagePreview: { width: 90, height: 90, borderRadius: 15, borderWidth: 1, borderColor: '#DDD' },
  removeImage: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FFF', borderRadius: 10 },

  variationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addVariationBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E9F7EF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  addVariationText: { marginLeft: 5, color: '#28a745', fontWeight: 'bold', fontSize: 13 },

  variationCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 10, elevation: 2 },
  varTitleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  varLabel: { fontSize: 12, fontWeight: 'bold', color: '#666' },
  smallInput: { backgroundColor: '#F1F3F5', borderRadius: 10, padding: 10, fontSize: 14, marginRight: 8 },

  saveButton: { backgroundColor: '#28a745', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 40, elevation: 4, shadowColor: '#28a745', shadowOpacity: 0.3, shadowRadius: 8 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});