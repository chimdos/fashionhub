import React, { createContext, useState, ReactNode, useContext } from 'react';
import { Alert } from 'react-native';

// A "forma" (interface) de um item na mala permanece a mesma
interface BagItem {
  id: string; // Este será o ID da variação do produto
  nome: string;
  tamanho: string;
  cor: string;
  preco: number;
}

// --- ALTERAÇÃO 1: Adicionamos as novas funções à "forma" do nosso contexto ---
interface BagContextData {
  items: BagItem[];
  addToBag: (item: any) => void;
  removeFromBag: (itemId: string) => void; // Função para remover um item
  clearBag: () => void;
  isInBag: (itemId: string) => boolean;   // Função para verificar se um item existe
  itemCount: number;
}

// A criação do contexto permanece a mesma
export const BagContext = createContext<BagContextData>({} as BagContextData);

interface BagProviderProps {
  children: ReactNode;
}

export const BagProvider = ({ children }: BagProviderProps) => {
  const [items, setItems] = useState<BagItem[]>([]);

  // A sua função addToBag permanece igual
  const addToBag = (productVariation: any) => {
    const existingItem = items.find(item => item.id === productVariation.id);

    if (existingItem) {
      Alert.alert("Item já adicionado", `${productVariation.produto.nome} (${productVariation.tamanho} - ${productVariation.cor}) já está na sua mala.`);
      return;
    }

    const newItem: BagItem = {
      id: productVariation.id,
      nome: productVariation.produto.nome,
      tamanho: productVariation.tamanho,
      cor: productVariation.cor,
      preco: parseFloat(productVariation.produto.preco),
    };

    setItems(prevItems => [...prevItems, newItem]);
    Alert.alert("Sucesso", `${newItem.nome} foi adicionado à sua mala!`);
  };

  // --- NOVA FUNÇÃO ---
  // Remove um item da mala com base no seu ID (ID da variação do produto)
  const removeFromBag = (itemId: string) => {
    // Filtra a lista, mantendo apenas os itens cujo ID é DIFERENTE do ID a ser removido
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // A sua função clearBag permanece igual
  const clearBag = () => {
    setItems([]);
  };

  // --- NOVA FUNÇÃO ---
  // Verifica se um item (pelo seu ID) já está na mala. Retorna true ou false.
  const isInBag = (itemId: string) => {
    return items.some(item => item.id === itemId);
  };

  return (
    // --- ALTERAÇÃO 2: Fornecemos as novas funções para o resto da aplicação ---
    <BagContext.Provider value={{ items, addToBag, removeFromBag, clearBag, isInBag, itemCount: items.length }}>
      {children}
    </BagContext.Provider>
  );
};

// O seu hook personalizado permanece o mesmo e agora dará acesso às novas funções
export const useBag = () => {
  return useContext(BagContext);
};