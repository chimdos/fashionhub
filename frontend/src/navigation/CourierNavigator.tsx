import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CourierDashboardScreen } from '../screens/courier/CourierDashboardScreen';
import { PickupScreen } from '../screens/courier/PickupScreen';
import { DeliveryRouteScreen } from '../screens/courier/DeliveryRouteScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();

export function CourierNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CourierDashboard" 
        component={CourierDashboardScreen} 
        options={{ title: 'Painel de Entregas' }} 
      />
      <Stack.Screen 
        name="PickupScreen" 
        component={PickupScreen} 
        options={{ title: 'Retirada na Loja' }} 
      />
      <Stack.Screen 
        name="DeliveryRoute" 
        component={DeliveryRouteScreen} 
        options={{ title: 'Rota de Entrega' }} 
      />
      <Stack.Screen 
        name="LoginScreen" 
        component={LoginScreen} 
        options={{ headerShown: false }} 
      />
       <Stack.Screen 
        name="RegisterScreen" 
        component={RegisterScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}