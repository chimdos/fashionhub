import React, { useState, useContext, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, SafeAreaView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import axios from 'axios';
import Toast from 'react-native-toast-message';

export const EditStoreAddressScreen = ({ navigation }: any) => {
    const { user, updateUserData } = useContext(AuthContext) as any;
    const [loading, setLoading] = useState(false);

    const [cep, setCep] = useState(user?.cep || '');
    const [rua, setRua] = useState(user?.rua || '');
    const [numero, setNumero] = useState(user?.numero || '');
    const [bairro, setBairro] = useState(user?.bairro || '');
    const [cidade, setCidade] = useState(user?.cidade || '');
    const [estado, setEstado] = useState(user?.estado || '');

    useEffect(() => {
        if (user) {
            setCep(user.cep || '');
            setRua(user.rua || '');
            setNumero(user.numero || '');
            setBairro(user.bairro || '');
            setCidade(user.cidade || '');
            setEstado(user.estado || '');
        }
    }, [user]);

    const handleFetchAddress = async (value: string) => {
        const cleanedCep = value.replace(/\D/g, '');
        setCep(cleanedCep);

        if (cleanedCep.length === 8) {
            try {
                const response = await axios.get(`https://viacep.com.br/ws/${cleanedCep}/json/`);
                if (response.data.erro) {
                    Toast.show({
                        type: 'info',
                        text1: 'CEP não encontrado',
                        text2: 'Verifique os números e tente novamente.'
                    });
                    return;
                }
                setRua(response.data.logradouro);
                setBairro(response.data.bairro);
                setCidade(response.data.localidade);
                setEstado(response.data.uf);

                Toast.show({
                    type: 'success',
                    text1: 'Endereço localizado!',
                    text2: `${response.data.logradouro}, ${response.data.bairro}`
                });
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Erro de conexão',
                    text2: 'Não foi possível consultar o CEP automaticamente.'
                });
            }
        }
    };

    const handleSave = async () => {
        if (!cep || !rua || !numero || !cidade) {
            return Toast.show({
                type: 'info',
                text1: 'Dados incompletos',
                text2: 'Preencha os campos obrigatórios para salvar.'
            });
        }

        setLoading(true);
        try {
            const response = await api.put('/api/users/store/address', {
                cep, rua, numero, bairro, cidade, estado
            });

            if (response.data.user) {
                await updateUserData(response.data.user);
            }

            Toast.show({
                type: 'success',
                text1: 'Endereço Atualizado!',
                text2: 'As informações de logística foram salvas.'
            });

            setTimeout(() => {
                navigation.goBack();
            }, 1500);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Falha ao salvar',
                text2: error.response?.data?.message || 'Não foi possível atualizar o endereço.'
            });
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
                <Text style={styles.headerTitle}>Endereço e Logística</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#28a745" /> : <Text style={styles.saveText}>Salvar</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.label}>CEP</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="map-outline" size={20} color="#28a745" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={cep}
                            onChangeText={handleFetchAddress}
                            keyboardType="numeric"
                            maxLength={8}
                            placeholder="00000000"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 3, marginRight: 10 }}>
                            <Text style={styles.label}>RUA / LOGRADOURO</Text>
                            <TextInput style={styles.smallInput} value={rua} onChangeText={setRua} placeholder="Rua..." />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Nº</Text>
                            <TextInput style={styles.smallInput} value={numero} onChangeText={setNumero} placeholder="123" />
                        </View>
                    </View>

                    <Text style={[styles.label, { marginTop: 15 }]}>BAIRRO</Text>
                    <TextInput style={styles.smallInput} value={bairro} onChangeText={setBairro} placeholder="Bairro..." />

                    <View style={[styles.row, { marginTop: 15 }]}>
                        <View style={{ flex: 2, marginRight: 10 }}>
                            <Text style={styles.label}>CIDADE</Text>
                            <TextInput style={styles.smallInput} value={cidade} editable={false} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>UF</Text>
                            <TextInput style={styles.smallInput} value={estado} editable={false} />
                        </View>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="bicycle-outline" size={20} color="#ADB5BD" />
                    <Text style={styles.infoText}>
                        Este endereço será utilizado para o cálculo de entregas e retiradas das malas.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    saveText: { color: '#28a745', fontWeight: 'bold', fontSize: 16 },
    backButton: { padding: 4 },
    container: { padding: 20 },
    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    label: { fontSize: 11, fontWeight: 'bold', color: '#ADB5BD', marginBottom: 8, letterSpacing: 1 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F5', borderRadius: 12, marginBottom: 15, paddingHorizontal: 12, height: 55 },
    smallInput: { backgroundColor: '#F1F3F5', borderRadius: 12, paddingHorizontal: 12, height: 50, fontSize: 16, color: '#333' },
    row: { flexDirection: 'row' },
    icon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: '#333' },
    infoBox: { flexDirection: 'row', alignItems: 'center', padding: 20, marginTop: 10 },
    infoText: { flex: 1, marginLeft: 10, color: '#ADB5BD', fontSize: 13, lineHeight: 18 }
});