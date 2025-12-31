import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';

export const PerfilScreen = () => {
  const navigation = useNavigation<any>();

  const [myBags, setMyBags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Função de procurar itens e mala
  useEffect(() => {
    fetchMyBags();
  }, []);

  const fetchMyBags = async () => {
    try {
      const response = await api.get('/api/bags');
      setMyBags(response.data);
    } catch (error) {
      console.log('Erro ao buscar malas', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBagPress = (bag: any) => {
    if (bag.status === 'ENTREGUE') {
      navigation.navigate('BagSelection', { bag });
    } else {
      Alert.alert('Aguarde', `O status atual é: ${bag.status}. Você só pode abrir a mala quando ela for entregue.`);
    }
  };

  const renderBagItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleBagPress(item)}
    >
      <View>
        <Text style={styles.cardTitle}>Mala #{item.id.slice(0, 8)}</Text>
        <Text style={styles.cardStatus}>Status: {item.status}</Text>
        <Text style={styles.cardDate}>
          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </Text>
      </View>

      {item.status === 'ENTREGUE' && (
        <View style={styles.actionBadge}>
          <Text style={styles.actionText}>ABRIR 🛍️</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Pedidos</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={myBags}
          keyExtractor={(item) => item.id}
          renderItem={renderBagItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não pediu nenhuma mala.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50 },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  cardStatus: { fontSize: 14, color: '#666', marginTop: 4 },
  cardDate: { fontSize: 12, color: '#999', marginTop: 4 },

  actionBadge: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50'
  },
  actionText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 12 }
});