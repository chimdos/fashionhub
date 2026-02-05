import React, { useState, useEffect } from 'react';
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

const InputField = ({ label, icon, value, onChangeText, editable = true, ...props }: any) => (
    <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={[styles.inputContainer, !editable && styles.inputDisabled]}>
            <Ionicons name={icon} size={20} color={editable ? "#28a745" : "#ADB5BD"} style={styles.inputIcon} />
            <TextInput
                style={[styles.input, !editable && { color: '#ADB5BD' }]}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor="#ADB5BD"
                editable={editable}
                {...props}
            />
        </View>
    </View>
);

export const EditWorkerScreen = ({ navigation, route }: any) => {
    const { worker } = route.params;

    const [nome, setNome] = useState(worker.nome);
    const [telefone, setTelefone] = useState(worker.telefone);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!nome || !telefone) {
            return Toast.show({
                type: 'info',
                text1: 'Campos vazios',
                text2: 'O nome e telefone não podem ficar em branco.'
            });
        }

        try {
            setLoading(true);

            await api.put(`/api/store/workers/${worker.id}`, {
                nome,
                telefone
            });

            Toast.show({
                type: 'success',
                text1: 'Dados Atualizados!',
                text2: `As informações de ${nome} foram salvas.`
            });

            setTimeout(() => navigation.goBack(), 1500);

        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao atualizar dados.';
            Toast.show({
                type: 'error',
                text1: 'Falha na atualização',
                text2: message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Editar Colaborador</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.infoBox}>
                        <View style={styles.avatarLarge}>
                            <Text style={styles.avatarTextLarge}>{worker.nome.charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={styles.workerEmailDisplay}>{worker.email}</Text>
                    </View>

                    <View style={styles.formCard}>
                        <InputField
                            label="Nome Completo"
                            icon="person-outline"
                            value={nome}
                            onChangeText={setNome}
                        />

                        <InputField
                            label="WhatsApp / Telefone"
                            icon="call-outline"
                            value={telefone}
                            onChangeText={setTelefone}
                            keyboardType="phone-pad"
                        />

                        <InputField
                            label="E-mail (Não editável)"
                            icon="mail-outline"
                            value={worker.email}
                            editable={false}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.primaryButton, loading && { opacity: 0.7 }]}
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Salvar Alterações</Text>
                                <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" style={{ marginLeft: 8 }} />
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
    avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    avatarTextLarge: { fontSize: 32, color: '#28a745', fontWeight: 'bold' },
    workerEmailDisplay: { fontSize: 16, color: '#666' },
    formCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, marginBottom: 25 },
    inputWrapper: { marginBottom: 20 },
    inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#ADB5BD', marginBottom: 8, textTransform: 'uppercase' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#F1F3F5' },
    inputDisabled: { backgroundColor: '#E9ECEF', borderColor: '#DEE2E6' },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: 50, color: '#333', fontSize: 16 },
    primaryButton: { backgroundColor: '#28a745', height: 60, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#28a745', shadowOpacity: 0.3, shadowRadius: 10 },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});