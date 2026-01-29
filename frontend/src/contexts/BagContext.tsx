import React, { createContext, useState, ReactNode, useContext } from 'react';
import { Alert } from 'react-native';

interface BagItem {
  id: string;
  nome: string;
  tamanho: string;
  cor: string;
  preco: number;
  lojista_id: string;
}

interface BagContextData {
  items: BagItem[];
  addToBag: (item: any) => void;
  removeFromBag: (itemId: string) => void;
  clearBag: () => void;
  isInBag: (itemId: string) => boolean;
  itemCount: number;
}

export const BagContext = createContext<BagContextData>({} as BagContextData);

interface BagProviderProps {
  children: ReactNode;
}

export const BagProvider = ({ children }: BagProviderProps) => {
  const [items, setItems] = useState<BagItem[]>([]);

  const addToBag = (productVariation: any) => {
    const newItem: BagItem = {
      id: productVariation.id,
      nome: productVariation.produto.nome,
      tamanho: productVariation.tamanho,
      cor: productVariation.cor,
      preco: typeof productVariation.produto.preco === 'string'
        ? parseFloat(productVariation.produto.preco)
        : productVariation.produto.preco,
      lojista_id: productVariation.lojista_id,
    };

    if (items.some(item => item.id === newItem.id)) {
      return;
    }

    if (items.length > 0) {
      const currentLojistaId = items[0].lojista_id;

      if (newItem.lojista_id !== currentLojistaId) {
        throw new Error("DIFERENTE_LOJISTA");
      }
    }

    setItems(prevItems => [...prevItems, newItem]);
  };

  const removeFromBag = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const clearBag = () => {
    setItems([]);
  };

  const isInBag = (itemId: string) => {
    return items.some(item => item.id === itemId);
  };

  return (
    <BagContext.Provider value={{
      items,
      addToBag,
      removeFromBag,
      clearBag,
      isInBag,
      itemCount: items.length
    }}>
      {children}
    </BagContext.Provider>
  );
};

export const useBag = () => {
  return useContext(BagContext);
};