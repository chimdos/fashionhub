import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CourierTabNavigator } from './CourierTabNavigator';
import { PickupScreen } from '../screens/courier/PickupScreen';
import { DeliveryRouteScreen } from '../screens/courier/DeliveryRouteScreen';

const Stack = createNativeStackNavigator();

export function CourierNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={CourierTabNavigator} 
        options={{ headerShown: false }} 
      />
      
      <Stack.Screen 
        name="PickupScreen" 
        component={PickupScreen} 
        options={{ title: 'Retirar Mala' }} 
      />
      <Stack.Screen 
        name="DeliveryRoute" 
        component={DeliveryRouteScreen} 
        options={{ title: 'Rota de Entrega' }} 
      />
    </Stack.Navigator>
  );
}