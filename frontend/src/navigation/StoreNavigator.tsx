import React, { ComponentProps } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { StoreDashboardScreen } from '../screens/store/DashboardScreen';
import { ProductManagementScreen } from '../screens/store/ProductManagementScreen';
import { CreateProductScreen } from '../screens/store/CreateProductScreen';
import { EditProductScreen } from '../screens/store/EditProductScreen';
import { StoreSettingsScreen } from '../screens/store/StoreSettingsScreen';
import { ExploreScreen } from '../screens/client/ExploreScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ProductStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductList" component={ProductManagementScreen} />
      <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
    </Stack.Navigator>
  );
}

export function StoreNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: ComponentProps<typeof Ionicons>['name'] = 'alert-circle-outline';
          if (route.name === 'Explorar') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Requisições') {
            iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
          } else if (route.name === 'Meus Produtos') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Conta') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#28a745',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Explorar" component={ExploreScreen} />
      <Tab.Screen name="Requisições" component={StoreDashboardScreen} />
      <Tab.Screen name="Meus Produtos" component={ProductStackNavigator} />
      <Tab.Screen name="Conta" component={StoreSettingsScreen} />
    </Tab.Navigator>
  );
}