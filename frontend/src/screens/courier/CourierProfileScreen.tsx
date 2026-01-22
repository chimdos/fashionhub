import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, SafeAreaView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export const CourierProfileScreen = () => {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(false);

    const [veiculo, setVeiculo] = useState(user?.veiculo || '');
    const [placa, setPlaca] = useState(user?.placa || '');
    const [cnh, setCnh] = useState(user?.cnh || '');

    const handleUpdateProfile = async () => {
        if (!veiculo || !placa || !cnh) {
            Alert.alert('Atenção', 'Preencha todos os dados do veículo.');
            return;
        }

        setLoading(true);
        try {
            await api.put(`/api/users/${user?.id}`, {
                veiculo,
                placa: placa.toUpperCase(),
                cnh
            });

            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        } catch (error: any) {
            console.log(error);
            Alert.alert('Erro', 'Não foi possível atualizar os dados.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{user?.nome?.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.nome}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="motorbike" size={24} color="#28a745" />
                        <Text style={styles.sectionTitle}>Meu Veículo</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Modelo do Veículo (Ex: Honda CG 160)</Text>
                        <TextInput
                            style={styles.input}
                            value={veiculo}
                            onChangeText={setVeiculo}
                            placeholder="Ex: Yamaha Fazer 250"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Placa</Text>
                        <TextInput
                            style={[styles.input, { textTransform: 'uppercase' }]}
                            value={placa}
                            onChangeText={setPlaca}
                            placeholder="ABC-1234"
                            maxLength={8}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CNH</Text>
                        <TextInput
                            style={styles.input}
                            value={cnh}
                            onChangeText={setCnh}
                            placeholder="Número da sua CNH"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleUpdateProfile}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Text style={styles.saveButtonText}>SALVAR ALTERAÇÕES</Text>
                            <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                    <Text style={styles.logoutText}>Sair da Conta</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        alignItems: 'center', padding: 30, backgroundColor: '#FFF',
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2
    },
    avatarContainer: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFFFF4',
        justifyContent: 'center', alignItems: 'center', marginBottom: 15
    },
    avatarText: { fontSize: 28, fontWeight: 'bold', color: '#28a745' },
    userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    userEmail: { fontSize: 14, color: '#6C757D', marginTop: 4 },

    sectionCard: {
        backgroundColor: '#FFF', margin: 16, padding: 20, borderRadius: 20,
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 10 },

    inputGroup: { marginBottom: 15 },
    label: { fontSize: 12, fontWeight: 'bold', color: '#ADB5BD', marginBottom: 5, marginLeft: 4 },
    input: {
        backgroundColor: '#F1F3F5', padding: 12, borderRadius: 12,
        fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#DEE2E6'
    },

    saveButton: {
        backgroundColor: '#28a745', marginHorizontal: 16, height: 55, borderRadius: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 4
    },
    saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    logoutButton: { marginTop: 20, marginBottom: 40, alignItems: 'center' },
    logoutText: { color: '#dc3545', fontWeight: 'bold', fontSize: 14 }
});