import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import Toast from 'react-native-toast-message';

interface Worker {
    id: string;
    nome: string;
    email: string;
    ativo: boolean;
}

export const ManageWorkerScreen = ({ navigation }: any) => {
    const { token } = useContext(AuthContext);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lojas/workers', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setWorkers(response.data);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Erro de Conexão',
                text2: 'Não foi possível carregar sua equipe'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, []);

    const toggleWorkerStatus = (id: string, currentStatus: boolean, nome: string) => {
        Alert.alert(
            currentStatus ? 'Desativar Ajudante' : 'Ativar Ajudante',
            `Deseja alterar o acesso de ${nome}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            await api.patch(`/users/${id}/status`, {}, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            Toast.show({
                                type: 'success',
                                text1: 'Status Atualizado',
                                text2: `${nome} foi ${currentStatus ? 'desativado(a)' : 'ativado(a)'} com sucesso.`
                            });

                            fetchWorkers();
                        } catch (err) {
                            Toast.show({
                                type: 'error',
                                text1: 'Falha na Operação',
                                text2: 'Ocorreu um erro ao alterar o acesso.'
                            });
                        }
                    }
                }
            ]
        );
    };

    const renderWorker = ({ item }: any) => (
        <View style={styles.workerCard}>
            <View style={styles.workerInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                    <Text style={styles.workerName}>{item.nome}</Text>
                    <Text style={styles.workerEmail}>{item.email}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.statusButton, !item.ativo && styles.statusButtonInactive]}
                onPress={() => toggleWorkerStatus(item.id, item.ativo, item.nome)}
            >
                <Ionicons
                    name={item.ativo ? "person-remove-outline" : "person-add-outline"}
                    size={20}
                    color={item.ativo ? "#FF4D4D" : "#28a745"}
                />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Minha Equipe</Text>
                <TouchableOpacity onPress={() => navigation.navigate('RegisterWorker')}>
                    <Ionicons name="add-circle" size={28} color="#28a745" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#28a745" />
                </View>
            ) : (
                <FlatList
                    data={workers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderWorker}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchWorkers} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={60} color="#CCC" />
                            <Text style={styles.emptyText}>Nenhum ajudante cadastrado ainda.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 20, backgroundColor: '#FFF'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20 },
    workerCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 12,
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
    },
    workerInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E8F5E9',
        justifyContent: 'center', alignItems: 'center', marginRight: 12
    },
    avatarText: { color: '#28a745', fontWeight: 'bold', fontSize: 18 },
    workerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    workerEmail: { fontSize: 13, color: '#666' },
    statusButton: { padding: 8, borderRadius: 10, backgroundColor: '#FFF0F0' },
    statusButtonInactive: { backgroundColor: '#E8F5E9' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#ADB5BD', marginTop: 10, fontSize: 16 }
});