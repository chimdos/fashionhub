import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export const ChangePasswordScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return Alert.alert("Erro", "Preencha todos os campos.");
        }

        if (newPassword.length < 8) {
            return Alert.alert("Segurança", "A nova senha deve ter pelo menos 8 caracteres.");
        }

        if (newPassword !== confirmPassword) {
            return Alert.alert("Erro", "A nova senha e a confirmação não coincidem.");
        }

        setLoading(true);
        try {
            await api.put('/api/users/change-password', {
                currentPassword,
                newPassword
            });

            Alert.alert("Sucesso", "Sua senha foi alterada com sucesso!");
            navigation.goBack();
        } catch (error: any) {
            const message = error.response?.data?.message || "Não foi possível alterar a senha.";
            Alert.alert("Erro", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Segurança</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.container}>
                    <Text style={styles.sectionTitle}>Alterar Senha</Text>

                    <View style={styles.card}>
                        <Text style={styles.label}>SENHA ATUAL</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-open-outline" size={20} color="#28a745" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                secureTextEntry
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Digite a senha atual"
                            />
                        </View>

                        <Text style={styles.label}>NOVA SENHA</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#28a745" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Mínimo 8 caracteres"
                            />
                        </View>

                        <Text style={styles.label}>CONFIRMAR NOVA SENHA</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#28a745" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Repita a nova senha"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && { backgroundColor: '#A3D9B1' }]}
                            onPress={handleChangePassword}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Atualizar Senha</Text>}
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.helperText}>
                        Após alterar, você continuará logado, mas precisará da nova senha para futuros acessos.
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    backButton: { padding: 4 },
    container: { padding: 20 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#ADB5BD', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    label: { fontSize: 11, fontWeight: 'bold', color: '#ADB5BD', marginBottom: 8, letterSpacing: 1 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F5', borderRadius: 12, marginBottom: 20, paddingHorizontal: 12, height: 55 },
    icon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: '#333' },
    button: { backgroundColor: '#28a745', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    helperText: { textAlign: 'center', color: '#ADB5BD', fontSize: 13, marginTop: 20, paddingHorizontal: 20, lineHeight: 18 }
});