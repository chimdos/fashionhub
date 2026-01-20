import React, { useState, useContext } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, SafeAreaView, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

export const EditProfileScreen = ({ navigation }: any) => {
    const { user, setUser } = useContext(AuthContext) as any;
    const [loading, setLoading] = useState(false);

    const [nomeLoja, setNomeLoja] = useState(user?.nome_loja || '');
    const [descricao, setDescricao] = useState(user?.descricao || '');

    const handleSave = async () => {
        if (!nomeLoja) {
            return Alert.alert("Atenção", "O nome da loja não pode ficar vazio!");
        }

        setLoading(true);
        try {
            const response = await api.put('/api/users/store/profile', {
                nome_loja: nomeLoja,
                descricao: descricao,
            });

            setUser({
                ...user,
                nome_loja: nomeLoja,
                descricao: descricao
            });

            Alert.alert("Sucesso", "Perfil da loja atualizado!");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Erro", "Não foi possível atualizar o perfil.");
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
                <Text style={styles.headerTitle}>Editar Perfil</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#28a745" />
                    ) : (
                        <Text style={styles.saveText}>Salvar</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.label}>NOME DA LOJA</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="business-outline" size={20} color="#28a745" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={nomeLoja}
                            onChangeText={setNomeLoja}
                            placeholder="Ex: Minha Boutique"
                        />
                    </View>

                    <Text style={styles.label}>BIO / DESCRIÇÃO</Text>
                    <View style={[styles.inputContainer, styles.textAreaContainer]}>
                        <Ionicons name="reader-outline" size={20} color="#28a745" style={[styles.icon, { marginTop: 15 }]} />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={descricao}
                            onChangeText={setDescricao}
                            placeholder="Conte um pouco sobre o que sua loja vende..."
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#ADB5BD" />
                    <Text style={styles.infoText}>
                        Essas informações são públicas e ajudam os clientes a conhecerem melhor sua marca.
                    </Text>
                </View>
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
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    saveText: { color: '#28a745', fontWeight: 'bold', fontSize: 16 },

    container: { padding: 20 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10
    },
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
    textAreaContainer: { height: 120, alignItems: 'flex-start' },
    icon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: '#333' },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: 15 },

    infoBox: { flexDirection: 'row', alignItems: 'center', padding: 20, marginTop: 10 },
    infoText: { flex: 1, marginLeft: 10, color: '#ADB5BD', fontSize: 13, lineHeight: 18 }
});