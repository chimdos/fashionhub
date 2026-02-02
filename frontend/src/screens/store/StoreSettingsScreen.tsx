import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Modal,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

export const StoreSettingsScreen = ({ navigation }: any) => {
  const { signOut, user } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    setTimeout(() => {
      signOut();
      Toast.show({
        type: 'info',
        text1: 'Sessão encerrada',
        text2: 'Até logo!'
      });
    }, 300);
  };

  const SettingItem = ({ icon, label, onPress, color = "#333", last = false }: any) => (
    <TouchableOpacity
      style={[styles.menuItem, last && { borderBottomWidth: 0 }]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.menuItemText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="log-out" size={40} color="#FF4D4D" />
            </View>
            <Text style={styles.modalTitle}>Encerrar Sessão</Text>
            <Text style={styles.modalMessage}>Tem certeza que deseja sair da conta da loja?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.storeAvatar}>
            <Ionicons name="business" size={40} color="#28a745" />
          </View>
          <Text style={styles.storeName}>{user?.nome_loja || 'Minha Loja'}</Text>
          <Text style={styles.storeCnpj}>CNPJ: {user?.cnpj || '00.000.000/0000-00'}</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Vendas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Produtos</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Gerenciamento</Text>
        <View style={styles.menuCard}>
          <SettingItem
            icon="person-outline"
            label="Dados do Responsável"
            onPress={() => navigation.navigate('EditResponsibleData')}
            color="#28a745"
          />
          <SettingItem
            icon="storefront-outline"
            label="Perfil da Loja"
            onPress={() => navigation.navigate('EditStoreProfile')}
            color="#28a745"
          />
          <SettingItem
            icon="location-outline"
            label="Endereço e Logística"
            onPress={() => navigation.navigate('EditStoreAddress')}
            color="#28a745"
            last
          />
        </View>

        <Text style={styles.sectionTitle}>Equipe e Colaboradores</Text>
        <View style={styles.menuCard}>
          <SettingItem
            icon="people-outline"
            label="Gerenciar Ajudantes"
            onPress={() => navigation.navigate('ManageWorkers')}
            color="#007bff"
          />
          <SettingItem
            icon="person-add-outline"
            label="Cadastrar Novo Ajudante"
            onPress={() => navigation.navigate('RegisterWorker')}
            color="#007bff"
            last
          />
        </View>

        <Text style={styles.sectionTitle}>Segurança e Suporte</Text>
        <View style={styles.menuCard}>
          <SettingItem
            icon="shield-checkmark-outline"
            label="Alterar Senha"
            onPress={() => navigation.navigate('ChangePassword')}
            color="#666"
          />
          <SettingItem
            icon="help-buoy-outline"
            label="Central de Ajuda"
            onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'Suporte Online 🎧',
                text2: 'A central de ajuda está em manutenção.'
              });
            }}
            color="#666"
            last
          />
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <Ionicons name="log-out-outline" size={22} color="#FF4D4D" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>FashionHub Business v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 25 },
  storeAvatar: {
    width: 90, height: 90, borderRadius: 30, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 15
  },
  storeName: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  storeCnpj: { fontSize: 14, color: '#666', marginTop: 4 },
  statsCard: {
    flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, padding: 20,
    marginBottom: 30, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  statLabel: { fontSize: 12, color: '#ADB5BD', textTransform: 'uppercase', marginTop: 4 },
  statDivider: { width: 1, height: '100%', backgroundColor: '#F1F3F5' },
  sectionTitle: {
    fontSize: 13, fontWeight: 'bold', color: '#ADB5BD', textTransform: 'uppercase',
    marginBottom: 12, marginLeft: 4, letterSpacing: 1
  },
  menuCard: {
    backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 16,
    marginBottom: 25, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F3F5'
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 38, height: 38, borderRadius: 10, justifyContent: 'center',
    alignItems: 'center', marginRight: 12
  },
  menuItemText: { fontSize: 16, color: '#333', fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF', height: 55, borderRadius: 15, marginTop: 10,
    borderWidth: 1, borderColor: '#FFEBEB'
  },
  logoutText: { color: '#FF4D4D', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  versionText: { textAlign: 'center', color: '#ADB5BD', fontSize: 12, marginTop: 30 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    elevation: 10
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  modalMessage: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  modalButtons: { flexDirection: 'row', width: '100%' },
  cancelButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#F1F3F5'
  },
  cancelButtonText: { color: '#666', fontWeight: 'bold', fontSize: 16 },
  confirmButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#FF4D4D'
  },
  confirmButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});