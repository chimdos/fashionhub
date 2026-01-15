import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryButtonProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

export const CategoryButton = ({ iconName, label, onPress }: CategoryButtonProps) => {
  return (
    <View style={styles.lightWrapper}>
      <View style={styles.darkWrapper}>
        <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
          <Ionicons name={iconName} size={30} color="#5DADE2" />
          <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    width: 90,
    height: 100,
    borderRadius: 22,
    marginHorizontal: 8,
    padding: 10,
    marginBottom: 15,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
  },
  lightWrapper: {
    marginHorizontal: 8,
    borderRadius: 22,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  darkWrapper: {
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonContainer: {
    backgroundColor: '#FFFFFF',
    width: 90,
    height: 100,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
});