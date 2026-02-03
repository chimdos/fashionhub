import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeWorkerScreen } from '../screens/worker/HomeWorkerScreen';
import { BagDetailScreen } from '../screens/store/BagDetailScreen';

const Stack = createNativeStackNavigator();

export const WorkerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeWorker" component={HomeWorkerScreen} />
      <Stack.Screen name="BagDetail" component={BagDetailScreen} />
    </Stack.Navigator>
  );
};