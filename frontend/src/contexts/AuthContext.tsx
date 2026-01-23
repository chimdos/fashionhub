import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { setSignOutAction } from '../services/apiInterceptor';

interface User {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: 'cliente' | 'lojista' | 'entregador';
  telefone?: string,
  endereco?: {
    id: string,
    cep: string,
    rua: string,
    numero: string,
    bairro: string,
    cidade: string,
    estado: string,
  };
  nome_loja?: string;
  cnpj?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  veiculo?: string;
  placa?: string;
  cnh?: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn(userData: User, userToken: string): Promise<void>;
  signOut(): Promise<void>;
  updateUser: (user: User) => Promise<void>;
  updateUserData(newData: Partial<User>): Promise<void>;
  updateSession(newUser: User, newToken?: string): Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = async () => {
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    setSignOutAction(signOut);

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

  async function updateUser(newUser: User) {
    setUser(newUser);
    await AsyncStorage.setItem('userData', JSON.stringify(newUser));
  }

  const updateUserData = async (newData: Partial<User>) => {
    try {
      if (!user) return;

      const updatedUser = { ...user, ...newData } as User;
      setUser(updatedUser);

      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

      console.log("Contexto e AsyncStorage atualizados.");
    } catch (e) {
      console.error("Erro ao persistir dados do usuário:", e)
    }
  };

  const updateSession = async (newUser: User, newToken?: string) => {
    try {
      setUser(newUser);

      await AsyncStorage.setItem('userData', JSON.stringify(newUser));

      if (newToken) {
        await AsyncStorage.setItem('userToken', newToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        console.log("Token de entregador ativado.");
      }
      console.log("Sessão atualizada.");
    } catch (e) {
      console.error("Erro ao atualizar sessão:", e);
      Alert.alert("Erro", "Falha ao sincronizar novos dados de acesso");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, updateUser, updateUserData, updateSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};