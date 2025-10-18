import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Este componente recebe a navegação para poder mudar de tela
export const CustomTabBar = ({ navigation, state }: any) => {
  // A 'state.index' nos diz qual aba está ativa
  const activeTabIndex = state.index;

  const navigateTo = (screenName: string) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigateTo('Home')} style={styles.tabButton}>
        <Ionicons name={activeTabIndex === 0 ? 'home' : 'home-outline'} size={24} color={activeTabIndex === 0 ? '#007bff' : 'gray'} />
        <Text style={[styles.tabLabel, { color: activeTabIndex === 0 ? '#007bff' : 'gray' }]}>Início</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigateTo('Explore')} style={styles.tabButton}>
        <Ionicons name={activeTabIndex === 1 ? 'search' : 'search-outline'} size={24} color={activeTabIndex === 1 ? '#007bff' : 'gray'} />
        <Text style={[styles.tabLabel, { color: activeTabIndex === 1 ? '#007bff' : 'gray' }]}>Explorar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigateTo('Cart')} style={styles.tabButton}>
        <Ionicons name={activeTabIndex === 2 ? 'briefcase' : 'briefcase-outline'} size={24} color={activeTabIndex === 2 ? '#007bff' : 'gray'} />
        <Text style={[styles.tabLabel, { color: activeTabIndex === 2 ? '#007bff' : 'gray' }]}>Mala</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigateTo('Settings')} style={styles.tabButton}>
        <Ionicons name={activeTabIndex === 3 ? 'menu' : 'menu-outline'} size={24} color={activeTabIndex === 3 ? '#007bff' : 'gray'} />
        <Text style={[styles.tabLabel, { color: activeTabIndex === 3 ? '#007bff' : 'gray' }]}>Menu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});
