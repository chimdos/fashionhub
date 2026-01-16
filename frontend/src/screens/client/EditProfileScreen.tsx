import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateUser } = useContext(AuthContext);

  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!nome || !email) {
      Alert.alert("Erro", "Preencha os campos.");
      return;
    }

    setIsLoading(true);
    try {
      await api.put(`/api/users/${user?.id}`, { nome, email });

      const updatedUser: any = {
        ...user,
        nome: nome,
        email: email,
      };

      await updateUser(updatedUser);
      Alert.alert("Sucesso", "Perfil atualizado!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.label}>Nome Completo</Text>
          <View style={styles.inputLightWrapper}>
            <View style={styles.inputDarkWrapper}>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={(txt) => setNome(txt)}
                placeholder="Nome"
              />
            </View>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputLightWrapper}>
            <View style={styles.inputDarkWrapper}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(txt) => setEmail(txt)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.btnLightWrapper}>
            <View style={styles.btnDarkWrapper}>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleUpdate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#333" />
                ) : (
                  <Text style={styles.saveButtonText}>SALVAR ALTERAÇÕES</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBFCFD' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  backButton: {
    width: 45,
    height: 45,
    backgroundColor: '#FFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: { padding: 25 },
  inputSection: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#888', marginBottom: 10, marginLeft: 5 },
  inputLightWrapper: {
    borderRadius: 15,
    shadowColor: "#FFF",
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  inputDarkWrapper: {
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    color: '#333',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#F8F9FA',
  },
  buttonContainer: { marginTop: 30 },
  btnLightWrapper: {
    borderRadius: 25,
    shadowColor: "#FFF",
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  btnDarkWrapper: {
    borderRadius: 25,
    shadowColor: "#4A9BCE",
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButton: {
    backgroundColor: '#5DADE2',
    height: 60,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
});