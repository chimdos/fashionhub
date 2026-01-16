import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { signOut, user } = useContext(AuthContext);

  const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Você tem certeza que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", onPress: () => signOut(), style: "destructive" }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <Text style={styles.headerTitle}>Configurações</Text>

        <View style={styles.profileLightWrapper}>
          <View style={styles.profileDarkWrapper}>
            <TouchableOpacity
              style={styles.profileCard}
              onPress={() => navigation.navigate('EditProfileScreen')}
              activeOpacity={0.7}
            >
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{getInitial(user?.nome || '')}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'email@exemplo.com'}</Text>
                <Text style={styles.editLink}>Toque para editar</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Conta</Text>

        <View style={styles.optionLightWrapper}>
          <View style={styles.optionDarkWrapper}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => navigation.navigate('BecomeCourierScreen')}
            >
              <View style={[styles.iconBox, { backgroundColor: '#EBF5FB' }]}>
                <Ionicons name="bicycle-outline" size={24} color="#5DADE2" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Trabalhe Conosco</Text>
                <Text style={styles.optionSubtitle}>Vire um entregador FashionHub</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.logoutLightWrapper}>
          <View style={styles.logoutDarkWrapper}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#E74C3C" style={{ marginRight: 10 }} />
              <Text style={styles.logoutText}>SAIR DA CONTA</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBFCFD' },
  container: { padding: 25, paddingBottom: 40 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 30 },

  profileLightWrapper: {
    borderRadius: 25, shadowColor: "#FFF", shadowOffset: { width: -5, height: -5 }, shadowOpacity: 1, shadowRadius: 10, marginBottom: 40,
  },
  profileDarkWrapper: {
    borderRadius: 25, shadowColor: "#000", shadowOffset: { width: 5, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5,
  },
  profileCard: {
    backgroundColor: '#FFF', borderRadius: 25, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarContainer: {
    width: 65, height: 65, borderRadius: 33, backgroundColor: '#5DADE2', justifyContent: 'center', alignItems: 'center',
    shadowColor: "#5DADE2", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  userInfo: { marginLeft: 20 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#888', marginTop: 2 },


  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#AAA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20, marginLeft: 5 },
  optionLightWrapper: {
    borderRadius: 20, shadowColor: "#FFF", shadowOffset: { width: -3, height: -3 }, shadowOpacity: 1, shadowRadius: 5, marginBottom: 20,
  },
  optionDarkWrapper: {
    borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 3, height: 5 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  optionButton: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0',
  },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  optionSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },

  logoutLightWrapper: {
    marginTop: 20, borderRadius: 20, shadowColor: "#FFF", shadowOffset: { width: -4, height: -4 }, shadowOpacity: 1, shadowRadius: 6,
  },
  logoutDarkWrapper: {
    borderRadius: 20, shadowColor: "#E74C3C", shadowOffset: { width: 4, height: 6 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  logoutButton: {
    height: 55, backgroundColor: '#FFF', borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FADBD8',
  },
  logoutText: { color: '#E74C3C', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },

  editLink: {
    fontSize: 12,
    color: '#5DADE2',
    marginTop: 5,
    fontWeight: '600',
  },
});