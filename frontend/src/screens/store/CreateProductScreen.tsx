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
  ActivityIndicator
} from 'react-native';
import api from '../../services/api';

export const CreateProductScreen = ({ navigation }: any) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // (Lógica para adicionar variações e imagens seria mais complexa,
  // por enquanto vamos focar no produto principal)

  const handleCreateProduct = async () => {
    if (!nome || !descricao || !preco || !categoria) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        nome,
        descricao,
        preco: parseFloat(preco),
        categoria,
        // Adicionar 'variacoes' e 'imagens' aqui futuramente
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Criar Novo Produto</Text>
      </View>
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Nome do Produto</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Camisa de Algodão"
          value={nome}
          onChangeText={setNome}
        />
        
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva seu produto..."
          value={descricao}
          onChangeText={setDescricao}
          multiline
        />
        
        <Text style={styles.label}>Preço (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 79.90"
          value={preco}
          onChangeText={setPreco}
          keyboardType="numeric"
        />
        
        <Text style={styles.label}>Categoria</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Camisas"
          value={categoria}
          onChangeText={setCategoria}
        />
        
        {/* Futuramente, adicione aqui os campos para Variações e Imagens */}
        
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
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
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
  buttonContainer: {
    marginTop: 30,
    marginBottom: 50,
  },
});