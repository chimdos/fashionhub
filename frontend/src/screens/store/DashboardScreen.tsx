import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert, // Para mostrar erros
} from 'react-native';
import api from '../../services/api'; // Certifique-se que o caminho está correto

// Define a "forma" esperada para uma solicitação de mala
interface BagRequest {
  id: string;
  status: string;
  data_solicitacao: string;
  cliente: {
    id: string;
    nome: string;
    email: string;
  };
  itemCount: number;
}

export const StoreDashboardScreen = () => {
  const [bagRequests, setBagRequests] = useState<BagRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Busca as solicitações da API quando a tela é carregada
    const fetchBagRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/bags/store');
        setBagRequests(response.data);
      } catch (err: any) {
        console.error("Erro ao buscar solicitações de malas:", err.response?.data || err.message);
        setError("Não foi possível carregar as solicitações. Tente novamente mais tarde.");
        Alert.alert("Erro", "Não foi possível carregar as solicitações.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBagRequests();
    // O array vazio [] como segundo argumento garante que a busca só ocorre uma vez
  }, []);

  // Componente para renderizar cada solicitação na lista
  const renderRequest = ({ item }: { item: BagRequest }) => (
    // No futuro, este TouchableOpacity pode navegar para uma tela de detalhes da mala
    <TouchableOpacity style={styles.requestCard}>
      <Text style={styles.cardTitle}>Solicitação #{item.id.substring(0, 6)}</Text>
      <Text style={styles.cardInfo}>Cliente: {item.cliente.nome}</Text>
      <Text style={styles.cardInfo}>Itens do Lojista: {item.itemCount}</Text>
      <Text style={styles.cardInfo}>Status: {item.status}</Text>
      <Text style={styles.cardDate}>
        Solicitada em: {new Date(item.data_solicitacao).toLocaleDateString('pt-BR')}
      </Text>
    </TouchableOpacity>
  );

  // Se estiver carregando, mostra o indicador
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#555" />
        <Text>Carregando solicitações...</Text>
      </View>
    );
  }

  // Se houve um erro na busca
  if (error) {
     return (
       <View style={styles.centerContainer}>
         <Text style={styles.errorText}>{error}</Text>
       </View>
     );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Solicitações de Mala</Text>
      </View>
      <FlatList
        data={bagRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Nenhuma solicitação de mala pendente encontrada.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  list: { padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: 'gray' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center'},
  requestCard: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  cardDate: {
      fontSize: 12,
      color: 'gray',
      marginTop: 5,
  }
});