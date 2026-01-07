import React, { useState, useEffect } from 'react';
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

export const EditProductScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/products/${productId}`);
        const product = response.data;
        setNome(product.nome);
        setDescricao(product.descricao);
        setPreco(product.preco.toString());
        setCategoria(product.categoria);
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados do produto.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleUpdateProduct = async () => {
    setIsLoading(true);
    try {
      const payload = {
        nome,
        descricao,
        preco: parseFloat(preco),
        categoria,
      };

      await api.put(`/api/products/${productId}`, payload);
      
      Alert.alert("Sucesso", "Produto atualizado com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      console.error("Erro ao atualizar produto:", error.response?.data || error);
      Alert.alert("Erro", "Não foi possível atualizar o produto.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#007bff" style={{ flex: 1 }} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar Produto</Text>
      </View>
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Nome do Produto</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} />
        
        <Text style={styles.label}>Descrição</Text>
        <TextInput style={[styles.input, styles.textArea]} value={descricao} onChangeText={setDescricao} multiline />
        
        <Text style={styles.label}>Preço (R$)</Text>
        <TextInput style={styles.input} value={preco} onChangeText={setPreco} keyboardType="numeric" />
        
        <Text style={styles.label}>Categoria</Text>
        <TextInput style={styles.input} value={categoria} onChangeText={setCategoria} />
        
        <View style={styles.buttonContainer}>
          <Button title="Salvar Alterações" onPress={handleUpdateProduct} />
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
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, fontSize: 16, backgroundColor: '#f9f9f9' },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 10 },
  buttonContainer: { marginTop: 30, marginBottom: 50 },
});