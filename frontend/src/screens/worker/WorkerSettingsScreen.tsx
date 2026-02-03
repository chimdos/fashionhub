import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

export const WorkerSettingsScreen = ({ navigation }: any) => {
    const { signOut, user } = useContext(AuthContext);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const confirmLogout = () => {
        setShowLogoutModal(false);
        setTimeout(() => {
            signOut();
            Toast.show({ type: 'info', text1: 'Sessão encerrada', text2: 'Bom descanso!' });
        }, 300);
    };

    const SettingItem = ({ icon, label, onPress, color = "#333", last = false }: any) => (
        <TouchableOpacity style={[styles.menuItem, last && { borderBottomWidth: 0 }]} onPress={onPress}>
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

            <Modal animationType="fade" transparent visible={showLogoutModal} onRequestClose={() => setShowLogoutModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconContainer}>
                            <Ionicons name="log-out" size={40} color="#FF4D4D" />
                        </View>
                        <Text style={styles.modalTitle}>Sair do App</Text>
                        <Text style={styles.modalMessage}>Deseja encerrar seu turno agora?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowLogoutModal(false)}>
                                <Text style={styles.cancelButtonText}>Continuar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={confirmLogout}>
                                <Text style={styles.confirmButtonText}>Sair</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.nome?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.nome}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Ajudante de Loja</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Minha Conta</Text>
                <View style={styles.menuCard}>
                    <SettingItem icon="person-outline" label="Editar Perfil" onPress={() => { }} color="#28a745" />
                    <SettingItem icon="shield-checkmark-outline" label="Segurança" onPress={() => navigation.navigate('ChangePassword')} color="#28a745" last />
                </View>

                <Text style={styles.sectionTitle}>Suporte</Text>
                <View style={styles.menuCard}>
                    <SettingItem icon="help-buoy-outline" label="Central de Ajuda" onPress={() => { }} color="#666" />
                    <SettingItem icon="document-text-outline" label="Termos de Uso" onPress={() => { }} color="#666" last />
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
                    <Ionicons name="log-out-outline" size={22} color="#FF4D4D" />
                    <Text style={styles.logoutText}>Encerrar Turno</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { padding: 24 },
    header: { alignItems: 'center', marginBottom: 30 },
    avatar: { width: 80, height: 80, borderRadius: 30, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 15 },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: '#28a745' },
    userName: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
    badge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
    badgeText: { color: '#28a745', fontSize: 12, fontWeight: 'bold' },
    sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#ADB5BD', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4, letterSpacing: 1 },
    menuCard: { backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 16, marginBottom: 25, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    menuItemText: { fontSize: 16, color: '#333', fontWeight: '500' },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', height: 55, borderRadius: 15, marginTop: 10, borderWidth: 1, borderColor: '#FFEBEB' },
    logoutText: { color: '#FF4D4D', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 25, padding: 25, alignItems: 'center' },
    modalIconContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
    modalMessage: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 25 },
    modalButtons: { flexDirection: 'row', width: '100%' },
    cancelButton: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderRadius: 12, backgroundColor: '#F1F3F5' },
    cancelButtonText: { color: '#666', fontWeight: 'bold' },
    confirmButton: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#FF4D4D' },
    confirmButtonText: { color: '#FFF', fontWeight: 'bold' },
});