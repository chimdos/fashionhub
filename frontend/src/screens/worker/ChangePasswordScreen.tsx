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
import api from '../../services/api';
import Toast from 'react-native-toast-message';

export const ChangePasswordScreen = ({ navigation }: any) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [secureMode, setSecureMode] = useState(true);

    const handleSave = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return Toast.show({
                type: 'error',
                text1: 'Campos Vazios',
                text2: 'Preencha todos os campos para continuar.'
            });
        }

        if (newPassword.length < 6) {
            return Toast.show({
                type: 'error',
                text1: 'Senha Fraca',
                text2: 'A nova senha deve ter pelo menos 6 caracteres.'
            });
        }

        if (newPassword !== confirmPassword) {
            return Toast.show({
                type: 'error',
                text1: 'Senhas Diferentes',
                text2: 'A nova senha e a confirmação não coincidem.'
            });
        }

        try {
            setLoading(true);

            await api.post('/api/users/change-password', {
                currentPassword,
                newPassword
            });

            Toast.show({
                type: 'success',
                text1: 'Senha Alterada',
                text2: 'Sua senha foi atualizada com sucesso!'
            });

            navigation.goBack();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao alterar senha.';
            Toast.show({
                type: 'error',
                text1: 'Falha na Alteração',
                text2: message
            });
        } finally {
            setLoading(false);
        }
    };

    const PasswordInput = ({ label, value, onChangeText, placeholder }: any) => (
        <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#ADB5BD" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={secureMode}
                    placeholderTextColor="#ADB5BD"
                />
                <TouchableOpacity onPress={() => setSecureMode(!secureMode)}>
                    <Ionicons name={secureMode ? "eye-off-outline" : "eye-outline"} size={20} color="#ADB5BD" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Segurança</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.infoSection}>
                        <View style={styles.shieldIcon}>
                            <Ionicons name="shield-checkmark" size={40} color="#28a745" />
                        </View>
                        <Text style={styles.infoTitle}>Alterar Senha</Text>
                        <Text style={styles.infoSubtitle}>
                            Sua senha deve conter pelo menos 6 caracteres e ser difícil de adivinhar.
                        </Text>
                    </View>

                    <View style={styles.formCard}>
                        <PasswordInput
                            label="Senha Atual"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Digite sua senha atual"
                        />

                        <View style={styles.divider} />

                        <PasswordInput
                            label="Nova Senha"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Digite a nova senha"
                        />

                        <PasswordInput
                            label="Confirmar Nova Senha"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Repita a nova senha"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Atualizar Senha</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    scrollContent: { padding: 24 },
    infoSection: { alignItems: 'center', marginBottom: 30 },
    shieldIcon: { width: 80, height: 80, borderRadius: 25, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    infoTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
    infoSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
    formCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, marginBottom: 25 },
    inputWrapper: { marginBottom: 15 },
    inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#ADB5BD', marginBottom: 8, textTransform: 'uppercase' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#F1F3F5' },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: 50, color: '#333', fontSize: 16 },
    divider: { height: 1, backgroundColor: '#F1F3F5', marginVertical: 15 },
    saveButton: { backgroundColor: '#28a745', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#28a745', shadowOpacity: 0.3, shadowRadius: 10 },
    saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});