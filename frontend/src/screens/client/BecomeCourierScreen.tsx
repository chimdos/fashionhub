import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext'; // Para atualizar o estado global do usuário
import api from '../../services/api';

export const BecomeCourierScreen = () => {
  const navigation = useNavigation<any>();
  const { updateUser } = useAuth(); // Precisa expor uma função para atualizar o user no contexto
  
  const [veiculo, setVeiculo] = useState('');
  const [placa, setPlaca] = useState('');
  const [cnh, setCnh] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!veiculo || !placa || !cnh) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/api/users/become-courier', {
        veiculo,
        placa,
        cnh
      });

      Alert.alert('Sucesso!', 'Você agora é um parceiro entregador. Faça login novamente para acessar o painel.');
      
      // Atualiza o tipo do usuário no estado global do aplicativo
      if (response.data.user) {
        await updateUser(response.data.user);
      }

      navigation.goBack();

    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao processar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seja um Parceiro 🏍️</Text>
      <Text style={styles.subtitle}>Faça uma renda extra entregando malas de roupas.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Modelo do Veículo (Ex: Honda CG 160)</Text>
        <TextInput 
          style={styles.input} 
          value={veiculo} 
          onChangeText={setVeiculo}
          placeholder="Digite o modelo" 
        />

        <Text style={styles.label}>Placa</Text>
        <TextInput 
          style={styles.input} 
          value={placa} 
          onChangeText={setPlaca} 
          placeholder="ABC-1234"
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Número da CNH</Text>
        <TextInput 
          style={styles.input} 
          value={cnh} 
          onChangeText={setCnh} 
          keyboardType="numeric"
          placeholder="Apenas números"
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ENVIAR CADASTRO</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  form: { gap: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 4 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 14, 
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  button: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});