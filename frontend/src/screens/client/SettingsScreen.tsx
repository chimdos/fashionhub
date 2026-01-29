import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView, Modal } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { signOut, user } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    setModalVisible(true);
  };

  const SettingItem = ({ icon, label, subLabel, color, onPress }: any) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View>
          <Text style={styles.itemLabel}>{label}</Text>
          {subLabel ? <Text style={styles.itemSubLabel}>{subLabel}</Text> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="log-out" size={30} color="#E74C3C" />
              </View>

              <Text style={styles.modalTitle}>Sair da conta?</Text>
              <Text style={styles.modalSubtitle}>
                Você precisará fazer login novamente para acessar suas malas.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    setModalVisible(false);
                    signOut();
                  }}
                >
                  <Text style={styles.confirmButtonText}>Sair</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.nome ? user.nome.substring(0, 2).toUpperCase() : '?'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'Acesse sua conta'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUA CONTA</Text>

          <SettingItem
            icon="person-outline"
            label="Dados do Perfil"
            subLabel="Nome, email e endereço"
            color="#5DADE2"
            onPress={() => navigation.navigate('EditProfileScreen')}
          />

          <SettingItem
            icon="lock-closed-outline"
            label="Segurança"
            subLabel="Alterar senha da conta"
            color="#AF7AC5"
            onPress={() => navigation.navigate('ChangePasswordScreen')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FASHIONHUB +</Text>

          <SettingItem
            icon="bicycle-outline"
            label="Trabalhe Conosco"
            subLabel="Seja um entregador parceiro"
            color="#28a745"
            onPress={() => navigation.navigate('BecomeCourierScreen')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPORTE E LEGAL</Text>

          <SettingItem
            icon="help-circle-outline"
            label="Central de Ajuda"
            color="#F39C12"
            onPress={() => Alert.alert("Suporte", "Em breve: Chat direto com a central.")}
          />

          <SettingItem
            icon="document-text-outline"
            label="Termos de Uso"
            color="#6C757D"
            onPress={() => { }}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#E74C3C" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>FashionHub v1.2.0 (Stable)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#FFF',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#EBF5FB', justifyContent: 'center', alignItems: 'center'
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#5DADE2' },
  headerInfo: { marginLeft: 15 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  userEmail: { fontSize: 14, color: '#6C757D' },

  section: { marginBottom: 25, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 12, fontWeight: 'bold', color: '#ADB5BD',
    marginBottom: 10, letterSpacing: 1
  },

  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  itemLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemSubLabel: { fontSize: 12, color: '#ADB5BD', marginTop: 1 },

  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 10, padding: 20
  },
  logoutText: { color: '#E74C3C', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  versionText: {
    textAlign: 'center', color: '#CCC', fontSize: 12,
    marginBottom: 40, marginTop: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FDEDEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  cancelButtonText: {
    color: '#6C757D',
    fontWeight: 'bold'
  },
  confirmButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E74C3C'
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: 'bold'
  }
});