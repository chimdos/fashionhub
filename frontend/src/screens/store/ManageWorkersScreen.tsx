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
            const response = await api.get('/api/store/workers', {
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
            `Deseja ${currentStatus ? 'bloquear' : 'liberar'} o acesso de ${nome}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            await api.patch(`/api/store/workers/${id}/status`, {
                                ativo: !currentStatus
                            });

                            Toast.show({
                                type: 'success',
                                text1: 'Status Atualizado',
                                text2: `${nome} agora está ${!currentStatus ? 'ativo(a)' : 'inativo(a)'}.`
                            });
                            fetchWorkers();
                        } catch (err) {
                            Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao alterar status.' });
                        }
                    }
                }
            ]
        );
    };

    const deleteWorker = (id: string, nome: string) => {
        Alert.alert(
            'Remover da Equipe',
            `Tem certeza que deseja excluir ${nome}? Esta ação não pode ser desfeita.`,
            [
                { text: 'Voltar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/api/store/workers/${id}`);
                            Toast.show({ type: 'success', text1: 'Removido', text2: 'Ajudante excluído da base.' });
                            fetchWorkers();
                        } catch (err) {
                            Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível excluir.' });
                        }
                    }
                }
            ]
        );
    };

    const renderWorker = ({ item }: any) => (
        <View style={[styles.workerCard, !item.ativo && styles.cardInactive]}>
            <View style={styles.workerInfo}>
                <View style={[styles.avatar, !item.ativo && styles.avatarInactive]}>
                    <Text style={[styles.avatarText, !item.ativo && styles.avatarTextInactive]}>
                        {item.nome.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View>
                    <Text style={[styles.workerName, !item.ativo && styles.textInactive]}>{item.nome}</Text>
                    <Text style={styles.workerEmail}>{item.email}</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('EditWorker', { worker: item })}
                >
                    <Ionicons name="create-outline" size={20} color="#007BFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleWorkerStatus(item.id, item.ativo, item.nome)}
                >
                    <Ionicons
                        name={item.ativo ? "lock-open-outline" : "lock-closed-outline"}
                        size={20}
                        color={item.ativo ? "#28a745" : "#FFC107"}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteWorker(item.id, item.nome)}
                >
                    <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
                </TouchableOpacity>
            </View>
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
    emptyText: { color: '#ADB5BD', marginTop: 10, fontSize: 16 },

    cardInactive: {
        backgroundColor: '#F1F3F5',
        elevation: 0,
        shadowOpacity: 0,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },

    avatarInactive: {
        backgroundColor: '#DEE2E6',
    },

    avatarTextInactive: {
        color: '#ADB5BD',
    },

    textInactive: {
        color: '#ADB5BD',
    },

    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    actionButton: {
        marginLeft: 8,
        padding: 8,
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});