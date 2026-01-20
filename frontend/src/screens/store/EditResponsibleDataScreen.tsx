import React, { useState, useContext } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, SafeAreaView, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

export const EditResponsibleDataScreen = ({ navigation }: any) => {
    const { user, setUser } = useContext(AuthContext) as any;
    const [loading, setLoading] = useState(false);

    const [nome, setNome] = useState(user?.nome || '');
    const [email, setEmail] = useState(user?.email || '');
    const [telefone, setTelefone] = useState(user?.telefone || '');

    const handleSave = async () => {
        if (!nome || !email) {
            return Alert.alert("Atenção", "Nome e e-mail são obrigatórios!");
        }

        setLoading(true);
        try {
            const response = await api.put('/api/users/responsible', {
                nome,
                email,
                telefone,
            });

            setUser({
                ...user,
                nome: nome,
                email: email,
                telefone: telefone
            });

            Alert.alert("Sucesso", "Dados atualizados!");
            navigation.goBack();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Erro ao atualizar seus dados.";
            Alert.alert("Erro", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dados do Responsável</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#28a745" /> : <Text style={styles.saveText}>Salvar</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.label}>NOME COMPLETO</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#28a745" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={nome}
                            onChangeText={setNome}
                            placeholder="Nome do responsável"
                        />
                    </View>

                    <Text style={styles.label}>E-MAIL DE ACESSO</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#28a745" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="email@exemplo.com"
                        />
                    </View>

                    <Text style={styles.label}>TELEFONE / WHATSAPP</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color="#28a745" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={telefone}
                            onChangeText={setTelefone}
                            keyboardType="phone-pad"
                            placeholder="(00) 00000-0000"
                        />
                    </View>
                </View>

                <Text style={styles.footerInfo}>
                    Estes dados são usados para comunicações administrativas e segurança da sua conta.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    saveText: { color: '#28a745', fontWeight: 'bold', fontSize: 16 },
    backButton: { padding: 4 },
    container: { padding: 20 },
    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    label: { fontSize: 11, fontWeight: 'bold', color: '#ADB5BD', marginBottom: 8, letterSpacing: 1 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F3F5',
        borderRadius: 12,
        marginBottom: 20,
        paddingHorizontal: 12,
        height: 55
    },
    icon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: '#333' },
    footerInfo: { textAlign: 'center', color: '#ADB5BD', fontSize: 13, marginTop: 25, paddingHorizontal: 20, lineHeight: 18 }
});