import React, { ComponentProps } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { StoreDashboardScreen } from '../screens/store/DashboardScreen';
import { BagDetailScreen } from '../screens/store/BagDetailScreen';
import { ProductManagementScreen } from '../screens/store/ProductManagementScreen';
import { CreateProductScreen } from '../screens/store/CreateProductScreen';
import { EditProductScreen } from '../screens/store/EditProductScreen';
import { StoreSettingsScreen } from '../screens/store/StoreSettingsScreen';
import { EditStoreProfileScreen } from '../screens/store/EditStoreProfileScreen';
import { EditResponsibleDataScreen } from '../screens/store/EditResponsibleDataScreen';
import { EditStoreAddressScreen } from '../screens/store/EditStoreAddressScreen';
import { ChangePasswordScreen } from '../screens/store/ChangePasswordScreen';
import { ExploreScreen } from '../screens/client/ExploreScreen';
import { ProductDetailScreen } from '../screens/client/ProductDetailScreen';
import { HelpCenterScreen } from '../screens/store/HelpCenterScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ExploreStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreHome" component={ExploreScreen} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          headerShown: true,
          title: 'Detalhes do Produto',
          headerTintColor: '#28a745'
        }}
      />
    </Stack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsHome" component={StoreSettingsScreen} />
      <Stack.Screen name="EditStoreProfile" component={EditStoreProfileScreen} />
      <Stack.Screen name="EditResponsibleData" component={EditResponsibleDataScreen} />
      <Stack.Screen name="EditStoreAddress" component={EditStoreAddressScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
    </Stack.Navigator>
  );
}

function ProductStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductList" component={ProductManagementScreen} />
      <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
    </Stack.Navigator>
  );
}

function BagStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BagList"
        component={StoreDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BagDetails"
        component={BagDetailScreen}
        options={{
          title: 'Detalhes da Solicitação',
          headerTintColor: '#28a745',
        }}
      />
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
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#F1F3F5',
          height: 60,
          paddingBottom: 10,
        }
      })}
    >
      <Tab.Screen name="Explorar" component={ExploreStackNavigator} />
      
      <Tab.Screen name="Requisições" component={BagStackNavigator} />
      
      <Tab.Screen name="Meus Produtos" component={ProductStackNavigator} />
      
      <Tab.Screen name="Conta" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
}