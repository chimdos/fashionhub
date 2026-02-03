import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Toast from 'react-native-toast-message';

export const WorkerEditProfileScreen = ({ navigation }: any) => {
    const { user, updateUserData } = useAuth();

    const [nome, setNome] = useState(user?.nome || '');
    const [telefone, setTelefone] = useState(user?.telefone || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!nome.trim()) {
            return Toast.show({
                type: 'error',
                text1: 'Campo Obrigatório',
                text2: 'O nome não pode ficar vazio.'
            });
        }

        try {
            setLoading(true);

            await api.put('/users/profile', {
                nome,
                telefone
            });

            await updateUserData({ nome, telefone });

            Toast.show({
                type: 'success',
                text1: 'Perfil Atualizado',
                text2: 'Seus dados foram salvos com sucesso!'
            });

            navigation.goBack();
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Erro ao Salvar',
                text2: 'Não foi possível atualizar seus dados agora.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Editar Perfil</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarLetter}>{nome.charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={styles.emailText}>{user?.email}</Text>
                    </View>

                    <View style={styles.formCard}>
                        <Text style={styles.inputLabel}>Nome Completo</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#ADB5BD" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={nome}
                                onChangeText={setNome}
                                placeholder="Seu nome"
                            />
                        </View>

                        <Text style={styles.inputLabel}>Telefone / WhatsApp</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color="#ADB5BD" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={telefone}
                                onChangeText={setTelefone}
                                placeholder="(00) 00000-0000"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle-outline" size={18} color="#666" />
                            <Text style={styles.infoText}>
                                Para alterar seu e-mail de acesso, entre em contato com o administrador da loja.
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#FFF'
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    scrollContent: { padding: 24 },
    avatarSection: { alignItems: 'center', marginBottom: 30 },
    avatarCircle: {
        width: 90, height: 90, borderRadius: 45, backgroundColor: '#28a745',
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
        elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
    },
    avatarLetter: { fontSize: 36, fontWeight: 'bold', color: '#FFF' },
    emailText: { color: '#666', fontSize: 14 },
    formCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 20,
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
        marginBottom: 25
    },
    inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#ADB5BD', marginBottom: 8, textTransform: 'uppercase' },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA',
        borderRadius: 12, paddingHorizontal: 15, marginBottom: 20,
        borderWidth: 1, borderColor: '#F1F3F5'
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: 50, color: '#333', fontSize: 16 },
    infoBox: { flexDirection: 'row', backgroundColor: '#FFF9E6', padding: 12, borderRadius: 12, alignItems: 'center' },
    infoText: { flex: 1, fontSize: 12, color: '#666', marginLeft: 8, lineHeight: 18 },
    saveButton: {
        backgroundColor: '#28a745', height: 55, borderRadius: 15,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowColor: '#28a745', shadowOpacity: 0.3, shadowRadius: 10
    },
    saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});