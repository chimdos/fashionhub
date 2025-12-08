import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image, // Importa o componente Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Importa o Picker
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker'; // Importa o Image Picker
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

// Define as categorias fixas
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
  const [images, setImages] = useState<Asset[]>([]); // Estado para guardar as imagens selecionadas
  const [isLoading, setIsLoading] = useState(false);
  const [variacoes, setVariacoes] = useState<VariationState[]>([]);

  // Função para abrir a galeria de imagens
  const handleSelectImages = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 5, // Limite de 5 fotos
        quality: 0.8,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('Seleção de imagem cancelada');
        } else if (response.errorCode) {
          console.log('Erro do ImagePicker: ', response.errorMessage);
          Alert.alert("Erro", "Não foi possível carregar a imagem.");
        } else if (response.assets) {
          setImages(response.assets);
        }
      }
    );
  };

  const handleCreateProduct = async () => {
    if (!nome || !descricao || !preco || !categoria) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);

    // --- LÓGICA DE UPLOAD (A SER IMPLEMENTADA) ---
    // O upload de arquivos (imagens) é um processo complexo.
    // O backend NÃO está preparado para receber arquivos ainda.
    // Por enquanto, vamos enviar o produto com URLs de placeholder
    // e mostraremos as imagens selecionadas no console.

    console.log("Imagens selecionadas para upload:", images.map(img => img.uri));

    try {
      const variationsPayload = variacoes.map(item => ({
        cor: item.cor,
        tamanho: item.tamanho,
        quantidade_estoque: parseInt(item.estoque) || 0,
        preco: item.preco ? parseFloat(item.preco) : null
      }));

      if (variationsPayload.length === 0) {
        Alert.alert("Adicione pelo menos uma variação (cor/tamanho) ao produto.");
        setIsLoading(false);
        return;
      }

      const payload = {
        nome,
        descricao,
        preco: parseFloat(preco),
        categoria,
        imagens: images.map((img, index) => ({
          url: `https://placehold.co/600x400?text=Imagem+${index + 1}`,
          ordem: index
        })),
        variacoes: variationsPayload
      };

      await api.post('/products', payload);

      Alert.alert("Sucesso", "Produto criado com sucesso!");
      navigation.goBack(); // Volta para a lista de produtos
    } catch (error: any) {
      console.error("Erro ao criar produto:", error.response?.data || error);
      Alert.alert("Erro", "Não foi possível criar o produto.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVariation = () => {
    // Cria o objeto segundo o molde da interface
    const newVariation: VariationState = {
      id: Date.now().toString(), // Gera um ID único baseado no milissegundo da requisição
      cor: '',
      tamanho: '',
      estoque: '',
      preco: '',
    };

    // Atualiza o estado de forma imutável
    // ...variacoes -> "Despeja" os itens antigos aqui
    // newVariation -> Adiciona o novo item no final
    setVariacoes([...variacoes, newVariation]);
  }

  const handleRemoveVariation = (idToRemove: string) => {
    const novaLista = variacoes.filter((item) => item.id !== idToRemove);

    setVariacoes(novaLista);
  }

  const handleUpdateVariation = (id: string, field: keyof VariationState, value: string) => {
    const novaLista = variacoes.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [field]: value
        };
      }
      return item;
    });
    setVariacoes(novaLista);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Novo Produto</Text>
      </View>
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Nome do Produto</Text>
        <TextInput style={styles.input} placeholder="Ex: Camisa de Algodão" value={nome} onChangeText={setNome} />

        <Text style={styles.label}>Descrição</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Descreva seu produto..." value={descricao} onChangeText={setDescricao} multiline />

        <Text style={styles.label}>Preço (R$)</Text>
        <TextInput style={styles.input} placeholder="Ex: 79.90" value={preco} onChangeText={setPreco} keyboardType="numeric" />

        <Text style={styles.label}>Categoria</Text>
        {/* --- NOVO COMPONENTE DE DROPDOWN --- */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoria}
            onValueChange={(itemValue, itemIndex) => setCategoria(itemValue)}
            style={styles.picker}
          >
            {CATEGORIAS_FIXAS.map(cat => (
              <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
            ))}
          </Picker>
        </View>

        {/* --- NOVA SEÇÃO DE IMAGENS --- */}
        <Text style={styles.label}>Imagens (Até 5)</Text>
        <TouchableOpacity style={styles.imageButton} onPress={handleSelectImages}>
          <Ionicons name="camera" size={24} color="#007bff" />
          <Text style={styles.imageButtonText}>Selecionar Fotos</Text>
        </TouchableOpacity>

        {/* Mostra as miniaturas das imagens selecionadas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
          {images.map((img, index) => (
            <Image key={index} source={{ uri: img.uri }} style={styles.imagePreview} />
          ))}
        </ScrollView>

        <Text style={styles.label}>Variações de Estoque</Text>
        {variacoes.map((item, index) => (
          <View key={item.id} style={styles.variationCard}>

            <View style={styles.variationHeader}>
              <Text style={styles.variationTitle}>Variação {index + 1}</Text>
              <TouchableOpacity onPress={() => handleRemoveVariation(item.id)}>
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              {/* COR */}
              <View style={[styles.col, { flex: 2 }]}>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="Cor (ex: Azul)"
                  value={item.cor}
                  // AQUI ESTÁ A MÁGICA: Passamos o ID e o nome do campo ('cor')
                  onChangeText={(txt) => handleUpdateVariation(item.id, 'cor', txt)}
                />
              </View>

              {/* TAMANHO */}
              <View style={[styles.col, { flex: 1 }]}>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="Tam"
                  value={item.tamanho}
                  onChangeText={(txt) => handleUpdateVariation(item.id, 'tamanho', txt)}
                />
              </View>
            </View>

            <View style={styles.row}>
              {/* ESTOQUE */}
              <View style={styles.col}>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="Qtd"
                  keyboardType="numeric"
                  value={item.estoque}
                  onChangeText={(txt) => handleUpdateVariation(item.id, 'estoque', txt)}
                />
              </View>

              {/* PREÇO */}
              <View style={styles.col}>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="Preço (opcional)"
                  keyboardType="numeric"
                  value={item.preco}
                  onChangeText={(txt) => handleUpdateVariation(item.id, 'preco', txt)}
                />
              </View>
            </View>

          </View>
        ))}

        <Button title="+ Adicionar Variação" onPress={handleAddVariation} color="#6c757d" />

        <View style={styles.buttonContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <Button title="Salvar Produto" onPress={handleCreateProduct} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  container: { padding: 20 },
  label: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 5, marginTop: 15 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    borderStyle: 'dashed',
    marginTop: 10,
  },
  imageButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 50,
  },
  variationCard: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  variationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  variationTitle: {
    fontWeight: 'bold',
    color: '#555',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  col: {
    flex: 1,
    marginRight: 5,
  },
  inputSmall: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    fontSize: 14,
  },
});