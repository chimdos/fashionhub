import React, { useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    TextInput, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import Toast from 'react-native-toast-message';

export const ChangePasswordScreen = ({ navigation }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleUpdatePassword = async () => {
        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            Toast.show({ type: 'info', text1: 'Campos vazios', text2: 'Preencha todos os campos para continuar.' });
            return;
        }

        if (novaSenha !== confirmarSenha) {
            Toast.show({ type: 'error', text1: 'Erro de senha', text2: 'As novas senhas não coincidem.' });
            return;
        }

        if (novaSenha.length < 8) {
            Toast.show({ type: 'info', text1: 'Senha curta', text2: 'A nova senha deve ter pelo menos 8 caracteres.' });
            return;
        }

        setIsLoading(true);
        try {
            await api.put('/api/users/change-password', {
                currentPassword: senhaAtual,
                newPassword: novaSenha
            });

            Toast.show({ type: 'success', text1: 'Sucesso! 🛡️', text2: 'Sua senha foi alterada corretamente.' });
            navigation.goBack();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Não foi possível alterar a senha.";
            Toast.show({ type: 'error', text1: 'Falha na segurança', text2: msg });
        } finally {
            setIsLoading(false);
        }
    };

    const CustomInput = ({ label, value, onChangeText, placeholder, ...props }: any) => (
        <View style={styles.inputSection}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputLightWrapper}>
                <View style={styles.inputDarkWrapper}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={value}
                            onChangeText={onChangeText}
                            placeholder={placeholder}
                            placeholderTextColor="#AAA"
                            secureTextEntry={!showPassword}
                            {...props}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#AAA" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Segurança</Text>
                <View style={{ width: 45 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Alterar Senha</Text>

                <CustomInput
                    label="Senha Atual"
                    value={senhaAtual}
                    onChangeText={setSenhaAtual}
                    placeholder="Sua senha atual"
                />

                <CustomInput
                    label="Nova Senha"
                    value={novaSenha}
                    onChangeText={setNovaSenha}
                    placeholder="Mínimo 8 caracteres"
                />

                <CustomInput
                    label="Confirmar Nova Senha"
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    placeholder="Repita a nova senha"
                />

                <View style={styles.buttonContainer}>
                    <View style={styles.btnLightWrapper}>
                        <View style={styles.btnDarkWrapper}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleUpdatePassword} disabled={isLoading}>
                                {isLoading ? <ActivityIndicator color="#333" /> : <Text style={styles.saveButtonText}>ATUALIZAR SENHA</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 15,
        paddingRight: 15,
    },
    input: {
        flex: 1,
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 52,
        color: '#333',
        fontSize: 15,
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#FBFCFD'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333'
    },
    backButton: {
        width: 45,
        height: 45,
        backgroundColor: '#FFF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    content: {
        padding: 25,
        paddingBottom: 60
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#5DADE2',
        marginTop: 30,
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    inputSection: {
        marginBottom: 18
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: 8,
        marginLeft: 5
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    inputLightWrapper: {
        borderRadius: 15,
        shadowColor: "#FFF",
        shadowOffset: { width: -3, height: -3 },
        shadowOpacity: 1,
        shadowRadius: 5,
    },
    inputDarkWrapper: {
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    disabledInput: {
        backgroundColor: '#F1F1F1',
        color: '#999',
    },

    buttonContainer: {
        marginTop: 40
    },
    btnLightWrapper: {
        borderRadius: 25,
        shadowColor: "#FFF",
        shadowOffset: { width: -4, height: -4 },
        shadowOpacity: 1,
        shadowRadius: 6,
    },
    btnDarkWrapper: {
        borderRadius: 25,
        shadowColor: "#4A9BCE",
        shadowOffset: { width: 4, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    saveButton: {
        backgroundColor: '#5DADE2',
        height: 60,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5
    },
});