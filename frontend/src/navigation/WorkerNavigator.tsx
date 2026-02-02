import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeWorkerScreen } from '../screens/worker/HomeWorkerScreen';

const Stack = createNativeStackNavigator();

export const WorkerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeWorker" component={HomeWorkerScreen} />
    </Stack.Navigator>
  );
};