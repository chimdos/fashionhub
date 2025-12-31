import { Alert } from 'react-native';

// Esta é uma função 'setter' para injetar o signOut do AuthContext
let signOutAction: () => Promise<void> = async () => {};

export const setSignOutAction = (signOut: () => Promise<void>) => {
  signOutAction = signOut;
};

/**
 * Esta função configura o interceptor usando a instância que 
 * for passada como argumento. Isso resolve o erro de 'undefined'.
 */
export const setupInterceptors = (apiInstance: any) => {
  apiInstance.interceptors.response.use(
    // Caso de Sucesso
    (response: any) => response,

    // Caso de Erro
    async (error: any) => {
      if (error.response?.status === 401) {
        console.log("Interceptor: Erro 401 detectado (Token inválido ou expirado).");
        
        Alert.alert(
          "Sessão Expirada",
          "A sua sessão expirou. Por favor, faça login novamente.",
          [{ text: "OK", onPress: async () => await signOutAction() }]
        );
        
        await signOutAction();
      }
      
      return Promise.reject(error);
    }
  );
};