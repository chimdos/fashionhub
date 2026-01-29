import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const CourierSettingsScreen = () => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation<any>();

    const SettingItem = ({ icon, label, onPress, color = "#333", subLabel = "" }: any) => (
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
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.nome?.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.userName}>{user?.nome}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CONTA</Text>
                    <SettingItem
                        icon="person-outline"
                        label="Dados do Perfil"
                        subLabel="Nome, Veículo, Placa e CNH"
                        color="#28a745"
                        onPress={() => navigation.navigate('CourierEditProfileScreen')}
                    />
                    <SettingItem
                        icon="lock-closed-outline"
                        label="Segurança"
                        subLabel="Alterar senha e biometria"
                        color="#5DADE2"
                        onPress={() => navigation.navigate('CourierChangePasswordScreen')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SUPORTE E LEGAL</Text>
                    <SettingItem
                        icon="help-circle-outline"
                        label="Central de Ajuda"
                        color="#F39C12"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="document-text-outline"
                        label="Termos de Uso"
                        color="#6C757D"
                        onPress={() => { }}
                    />
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                    <Ionicons name="log-out-outline" size={22} color="#dc3545" />
                    <Text style={styles.logoutText}>Sair da Conta</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>FashionHub Courier v1.0.4</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 25, backgroundColor: '#FFF', marginBottom: 20 },
    avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EFFFF4', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: '#28a745' },
    headerInfo: { marginLeft: 15 },
    userName: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    userEmail: { fontSize: 14, color: '#6C757D' },

    section: { marginBottom: 25, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#ADB5BD', marginBottom: 10, letterSpacing: 1 },

    item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 10 },
    itemLeft: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    itemLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
    itemSubLabel: { fontSize: 12, color: '#ADB5BD' },

    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, padding: 20 },
    logoutText: { color: '#dc3545', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    versionText: { textAlign: 'center', color: '#CCC', fontSize: 12, marginBottom: 30 }
});