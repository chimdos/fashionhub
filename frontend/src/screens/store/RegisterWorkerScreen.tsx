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

export const RegisterWorkerScreen = ({ navigation }: any) => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [telefone, setTelefone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!nome || !email || !senha || !telefone) {
            return Toast.show({
                type: 'info',
                text1: 'Campos incompletos',
                text2: 'Preencha todos os campos do novo colaborador!'
            });
        }

        if (senha.length < 8) {
            return Toast.show({
                type: 'error',
                text1: 'Senha muito curta',
                text2: 'Defina uma senha de pelo menos 8 caracteres!'
            });
        }

        try {
            setLoading(true);

            await api.post('/api/auth/register-worker', {
                nome,
                email,
                senha,
                telefone
            });

            Toast.show({
                type: 'success',
                text1: 'Ajudante Cadastrado!',
                text2: `${nome} agora faz parte da sua equipe.`
            });

            setTimeout(() => {
                navigation.goBack();
            }, 1500);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao cadastrar ajudante!';
            Toast.show({
                type: 'error',
                text1: 'Falha no cadastro!',
                text2: message
            });
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, icon, value, onChangeText, ...props }: any) => (
        <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputContainer}>
                <Ionicons name={icon} size={20} color="#28a745" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholderTextColor="#ADB5BD"
                    {...props}
                />
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
                    <Text style={styles.headerTitle}>Novo Ajudante</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.infoBox}>
                        <Ionicons name="people-circle-outline" size={50} color="#28a745" />
                        <Text style={styles.infoTitle}>Expandir Equipe</Text>
                        <Text style={styles.infoText}>
                            O ajudante terá acesso apenas à conferência e preparação das malas da sua loja.
                        </Text>
                    </View>

                    <View style={styles.formCard}>
                        <InputField
                            label="Nome Completo"
                            icon="person-outline"
                            value={nome}
                            onChangeText={setNome}
                            placeholder="Ex: João Silva"
                        />

                        <InputField
                            label="E-mail de Acesso"
                            icon="mail-outline"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="ajudante@email.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <InputField
                            label="WhatsApp / Telefone"
                            icon="call-outline"
                            value={telefone}
                            onChangeText={setTelefone}
                            placeholder="(00) 00000-0000"
                            keyboardType="phone-pad"
                        />

                        <InputField
                            label="Senha Temporária"
                            icon="lock-closed-outline"
                            value={senha}
                            onChangeText={setSenha}
                            placeholder="Mínimo 8 caracteres"
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.primaryButton, loading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Cadastrar Colaborador</Text>
                                <Ionicons name="add-circle-outline" size={22} color="#FFF" style={{ marginLeft: 8 }} />
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    scrollContent: { padding: 24 },
    infoBox: { alignItems: 'center', marginBottom: 30 },
    infoTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginTop: 10 },
    infoText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
    formCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, marginBottom: 25 },
    inputWrapper: { marginBottom: 20 },
    inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#ADB5BD', marginBottom: 8, textTransform: 'uppercase' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#F1F3F5' },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: 50, color: '#333', fontSize: 16 },
    primaryButton: { backgroundColor: '#28a745', height: 60, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#28a745', shadowOpacity: 0.3, shadowRadius: 10 },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});