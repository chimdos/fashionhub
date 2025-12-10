import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';

// Interface para os itens da tela
interface SelectionItem {
  id: string; // ID do BagItem
  variacao_produto: {
    produto: {
      nome: string;
      imagem_url?: string;
    };
    tamanho?: string;
    cor?: string;
  };
  preco_unitario_mala: string | number;
  selected: boolean; // Controle local da decisão do cliente
}

export const BagSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // Recebe o objeto da mala ou o ID vindo da tela anterior
  const { bag } = route.params; 

  const [items, setItems] = useState<SelectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Se a mala já veio com itens da tela anterior, usamos eles.
    // Caso contrário, buscaríamos da API. Vamos assumir que 'bag.itens' existe.
    if (bag && bag.itens) {
      const formattedItems = bag.itens.map((item: any) => ({
        ...item,
        selected: false // Começa tudo como "Devolver" ou true para "Comprar", você decide
      }));
      setItems(formattedItems);
      setLoading(false);
    } else {
        // Fallback se não tiver itens carregados (ex: buscar na API pelo bag.id)
        loadBagDetails();
    }
  }, [bag]);

  const loadBagDetails = async () => {
      try {
          // Ajuste a rota se necessário
          const response = await api.get(`/bags/${bag.id}`);
          const formattedItems = response.data.itens.map((item: any) => ({
            ...item,
            selected: false
          }));
          setItems(formattedItems);
      } catch (err) {
          Alert.alert('Erro', 'Não foi possível carregar os itens.');
          navigation.goBack();
      } finally {
          setLoading(false);
      }
  }

  // Recalcula total sempre que muda seleção
  useEffect(() => {
    const newTotal = items.reduce((acc, item) => {
      return item.selected ? acc + Number(item.preco_unitario_mala) : acc;
    }, 0);
    setTotal(newTotal);
  }, [items]);

  const toggleSelection = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleConfirmDecision = async () => {
    // Filtra apenas para garantir, mas enviaremos todos
    const itensCompradosPayload = items.map(item => ({
      item_id: item.id,
      comprar: item.selected
    }));

    // Verifica se o usuário selecionou algo (opcional)
    // if (total === 0) ... 

    setProcessing(true);

    try {
      const response = await api.post(`/bags/${bag.id}/confirm-purchase`, {
        itens_comprados: itensCompradosPayload
      });

      // O backend retorna: message, valorTotal, tokenDevolucao
      const { tokenDevolucao, valorTotal } = response.data;

      Alert.alert(
        'Sucesso!',
        `Compra finalizada: R$ ${Number(valorTotal).toFixed(2)}\n\n⚠️ GUARDE ESTE CÓDIGO: ${tokenDevolucao}\n\nO motoboy precisará dele para retirar as roupas devolvidas.`,
        [
          { 
            text: 'Entendi', 
            onPress: () => navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }], // Volta para Home
            })
          }
        ]
      );

    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao processar compra.');
    } finally {
      setProcessing(false);
    }
  };

  const renderItem = ({ item }: { item: SelectionItem }) => (
    <View style={styles.itemCard}>
      <Image 
        source={{ uri: item.variacao_produto.produto.imagem_url || 'https://via.placeholder.com/100' }} 
        style={styles.image} 
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.variacao_produto.produto.nome}</Text>
        <Text style={styles.details}>
            Tam: {item.variacao_produto.tamanho} | Cor: {item.variacao_produto.cor}
        </Text>
        <Text style={styles.price}>R$ {Number(item.preco_unitario_mala).toFixed(2)}</Text>
      </View>

      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, { color: item.selected ? '#4CAF50' : '#999' }]}>
            {item.selected ? 'FICAR' : 'DEVOLVER'}
        </Text>
        <Switch
          trackColor={{ false: "#767577", true: "#a5d6a7" }}
          thumbColor={item.selected ? "#4CAF50" : "#f4f3f4"}
          onValueChange={() => toggleSelection(item.id)}
          value={item.selected}
        />
      </View>
    </View>
  );

  if (loading) {
      return <ActivityIndicator size="large" color="#000" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>O que você vai amar? 😍</Text>
        <Text style={styles.headerSubtitle}>Selecione as peças para comprar.</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total a Pagar:</Text>
          <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, processing && styles.buttonDisabled]} 
          onPress={handleConfirmDecision}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>FINALIZAR E CHAMAR COLETA</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { padding: 20, backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },

  itemCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12,
    alignItems: 'center', elevation: 1
  },
  image: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#eee' },
  infoContainer: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  details: { fontSize: 12, color: '#888', marginVertical: 2 },
  price: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  
  switchContainer: { alignItems: 'center', minWidth: 70 },
  switchLabel: { fontSize: 10, fontWeight: 'bold', marginBottom: 4 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 20,
    borderTopWidth: 1, borderTopColor: '#eee', elevation: 10
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalLabel: { fontSize: 18, color: '#333' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
  
  button: { backgroundColor: '#000', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#777' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});