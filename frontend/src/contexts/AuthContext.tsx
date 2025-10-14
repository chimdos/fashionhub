import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

// Definindo a "forma" do nosso usuário
interface User {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: 'cliente' | 'lojista' | 'entregador';
}

// Definindo a "forma" de tudo o que nosso contexto vai fornecer
interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn(userData: User, userToken: string): Promise<void>;
  signOut(): Promise<void>;
}

// Criando o contexto com a tipagem correta
export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  const signIn = async (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    await AsyncStorage.setItem('userToken', userToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  };

  const signOut = async () => {
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

