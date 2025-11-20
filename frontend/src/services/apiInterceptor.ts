import { Alert } from 'react-native';
import api from './api';

// Esta é uma função 'setter' que nos permite "injetar" a função de signOut
// do AuthContext no nosso serviço de API, sem criar um loop de importação.

let signOutAction: () => Promise<void> = async () => {};

export const setSignOutAction = (signOut: () => Promise<void>) => {
  signOutAction = signOut;
};

// Configura o interceptor de resposta
api.interceptors.response.use(
  // Se a resposta for sucesso (2xx), apenas a retorna
  (response) => response,

  // Se a resposta for um erro...
  async (error) => {
    // Verifica se o erro é um 401 (Não Autorizado)
    if (error.response?.status === 401) {
      console.log("Interceptor: Erro 401 detetado (Token inválido ou expirado).");
      
      // Mostra um alerta ao usuário
      Alert.alert(
        "Sessão Expirada",
        "A sua sessão expirou. Por favor, faça login novamente.",
        [{ text: "OK", onPress: async () => await signOutAction() }]
      );
      
      // Chama a função de logout que foi injetada
      await signOutAction();
    }
    
    // Retorna o erro para que a tela que fez a chamada (ex: StoreDashboard)
    // ainda possa lidar com ele (ex: parar o loading)
    return Promise.reject(error);
  }
);