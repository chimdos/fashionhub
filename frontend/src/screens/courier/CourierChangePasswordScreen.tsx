import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export const CourierChangePasswordScreen = ({ navigation }: any) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Erro', 'A nova senha e a confirmação não coincidem.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            await api.put('/api/users/change-password', {
                currentPassword,
                newPassword
            });

            Alert.alert('Sucesso', 'Senha alterada com sucesso!');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Erro', error.response?.data?.message || 'Falha ao alterar senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.label}>Senha Atual</Text>
                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        secureTextEntry={!showPasswords}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="Digite sua senha atual"
                    />
                </View>

                <Text style={styles.label}>Nova Senha</Text>
                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        secureTextEntry={!showPasswords}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Mínimo 6 caracteres"
                    />
                </View>

                <Text style={styles.label}>Confirmar Nova Senha</Text>
                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        secureTextEntry={!showPasswords}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Repita a nova senha"
                    />
                    <TouchableOpacity onPress={() => setShowPasswords(!showPasswords)}>
                        <Ionicons name={showPasswords ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleChangePassword}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>ATUALIZAR SENHA</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    content: { padding: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 15 },
    inputGroup: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
        borderRadius: 12, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: '#EEE'
    },
    input: { flex: 1, fontSize: 16 },
    button: { backgroundColor: '#28a745', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});