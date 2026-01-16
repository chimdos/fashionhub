import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../contexts/AuthContext';

import { ClientNavigator } from './ClientNavigator';
import { StoreNavigator } from './StoreNavigator';
import { CourierNavigator } from './CourierNavigator';

import { WelcomeScreen } from '../screens/Auth/WelcomeScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/Auth/ResetPasswordScreen';
import { StoreRegisterScreen } from '../screens/Auth/StoreRegisterScreen';
import { ProductDetailScreen } from '../screens/client/ProductDetailScreen';
import { EditProfileScreen } from '../screens/client/EditProfileScreen';

const Stack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="StoreRegister" component={StoreRegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Nova Senha' }} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export const AppNavigator = () => {
  const { user, token, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token || !user ? (
        <Stack.Screen name="AuthFlow" component={AuthNavigator} />
      ) : (
        <>
          {user.tipo_usuario === 'cliente' && (
            <>
              <Stack.Screen name="ClientApp" component={ClientNavigator} />
              <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            </>
          )}
          {user.tipo_usuario === 'lojista' && (
            <Stack.Screen name="StoreApp" component={StoreNavigator} />
          )}
          {user.tipo_usuario === 'entregador' && (
            <Stack.Screen name="CourierApp" component={CourierNavigator} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});