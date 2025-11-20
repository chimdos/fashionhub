import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
// 1. Importa a função 'setSignOutAction' do nosso novo interceptor
import { setSignOutAction } from '../services/apiInterceptor';

// Interface do Usuário
interface User {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: 'cliente' | 'lojista' | 'entregador';
}

// Interface dos dados do Contexto
interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn(userData: User, userToken: string): Promise<void>;
  signOut(): Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- ALTERAÇÃO 2: Atualizamos a função signOut ---
  // A função de signOut agora também limpa o cabeçalho da API
  const signOut = async () => {
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
    // Limpa o token expirado dos cabeçalhos padrão da API
    delete api.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    // --- ALTERAÇÃO 3: Injetamos a função signOut no interceptor ---
    // Isso permite que o 'apiInterceptor' chame o signOut()
    // sem criar um loop de importação.
    setSignOutAction(signOut);

    // Esta função carrega os dados do usuário do armazenamento local
    async function loadStorageData() {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');

        if (storedToken && storedUser) {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Falha ao carregar dados do armazenamento", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStorageData();
  }, []);

  // A função signIn permanece a mesma
  const signIn = async (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    await AsyncStorage.setItem('userToken', userToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};