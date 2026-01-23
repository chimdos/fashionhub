import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, SafeAreaView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export const CourierProfileScreen = () => {
    const { user, updateSession, signOut } = useAuth();
    const [loading, setLoading] = useState(false);

    const [nome, setNome] = useState(user?.nome || '');
    const [veiculo, setVeiculo] = useState(user?.veiculo || '');
    const [placa, setPlaca] = useState(user?.placa || '');
    const [cnh, setCnh] = useState(user?.cnh || '');

    const handleUpdate = async () => {
        if (!veiculo || !placa || !cnh) {
            Alert.alert('Atenção', 'Os dados do veículo e CNH são obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.put(`/api/users/${user?.id}`, {
                nome,
                veiculo,
                placa: placa.toUpperCase(),
                cnh
            });

            if (response.data.user) {
                await updateSession(response.data.user);
                Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
            }
        } catch (error: any) {
            console.log(error);
            Alert.alert('Erro', error.response?.data?.message || 'Falha ao atualizar perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{user?.nome?.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.nome}</Text>
                    <Text style={styles.userRole}>Entregador Parceiro</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dados Pessoais</Text>
                        <View style={styles.inputGroup}>
                            <Ionicons name="person-outline" size={20} color="#ADB5BD" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={nome}
                                onChangeText={setNome}
                                placeholder="Seu nome completo"
                            />
                        </View>
                        <View style={[styles.inputGroup, styles.disabledInput]}>
                            <Ionicons name="mail-outline" size={20} color="#ADB5BD" style={styles.inputIcon} />
                            <Text style={styles.readOnlyText}>{user?.email}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dados do Veículo</Text>
                        <View style={styles.inputGroup}>
                            <MaterialCommunityIcons name="motorbike" size={20} color="#ADB5BD" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={veiculo}
                                onChangeText={setVeiculo}
                                placeholder="Modelo (Ex: Honda Biz 125)"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Ionicons name="barcode-outline" size={20} color="#ADB5BD" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { textTransform: 'uppercase' }]}
                                value={placa}
                                onChangeText={setPlaca}
                                placeholder="Placa (Ex: ABC-1234)"
                                maxLength={8}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Documentação</Text>
                        <View style={styles.inputGroup}>
                            <Ionicons name="card-outline" size={20} color="#ADB5BD" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={cnh}
                                onChangeText={setCnh}
                                placeholder="Número da CNH"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && { opacity: 0.7 }]}
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>SALVAR ALTERAÇÕES</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                        <Ionicons name="log-out-outline" size={20} color="#dc3545" />
                        <Text style={styles.logoutText}>Sair da conta</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#FFF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2 },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFFFF4', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    avatarText: { fontSize: 28, fontWeight: 'bold', color: '#28a745' },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
    userRole: { fontSize: 14, color: '#6C757D', marginTop: 4 },

    content: { padding: 20 },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15, marginLeft: 5 },

    inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 15, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: '#EEE', marginBottom: 10 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: '#333' },
    disabledInput: { backgroundColor: '#F1F3F5', borderColor: '#E9ECEF' },
    readOnlyText: { fontSize: 16, color: '#ADB5BD' },

    saveButton: { backgroundColor: '#28a745', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 4 },
    saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 50 },
    logoutText: { color: '#dc3545', fontSize: 16, fontWeight: '600', marginLeft: 8 }
});