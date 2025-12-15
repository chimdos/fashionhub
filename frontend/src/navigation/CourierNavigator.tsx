import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CourierDashboardScreen } from '../screens/courier/CourierDashboardScreen';
import { PickupScreen } from '../screens/courier/PickupScreen';
import { DeliveryRouteScreen } from '../screens/courier/DeliveryRouteScreen';

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
    </Stack.Navigator>
  );
}