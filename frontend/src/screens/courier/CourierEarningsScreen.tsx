import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, SafeAreaView,
    ActivityIndicator, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';

interface EarningItem {
    id: string;
    valor_frete: number;
    data_solicitacao: string;
    status: string;
}

export const CourierEarningsScreen = () => {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<EarningItem[]>([]);
    const [totalGeral, setTotalGeral] = useState(0);

    const fetchEarnings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/bags/history');
            if (Array.isArray(response.data)) {
                setHistory(response.data);

                const total = response.data.reduce((acc, curr) => acc + Number(curr.valor_frete), 0);
                setTotalGeral(total);
            }
        } catch (error) {
            console.log("Erro ao buscar ganhos:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchEarnings();
        }, [])
    );

    const renderHistoryItem = ({ item }: { item: EarningItem }) => (
        <View style={styles.historyCard}>
            <View style={styles.iconCircle}>
                <Ionicons name="checkmark-circle" size={24} color="#28a745" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.historyTitle}>Entrega Concluída</Text>
                <Text style={styles.historyDate}>
                    {new Date(item.data_solicitacao).toLocaleDateString('pt-BR')}
                </Text>
            </View>
            <Text style={styles.historyValue}>+ R$ {Number(item.valor_frete).toFixed(2)}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>SALDO TOTAL DISPONÍVEL</Text>
                <Text style={styles.balanceValue}>R$ {totalGeral.toFixed(2)}</Text>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>ENTREGAS</Text>
                        <Text style={styles.statValue}>{history.length}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>MÉDIA / KM</Text>
                        <Text style={styles.statValue}>R$ 2.50</Text>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Histórico de Recebimentos</Text>

                {loading && history.length === 0 ? (
                    <ActivityIndicator color="#28a745" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={history}
                        keyExtractor={(item) => item.id}
                        renderItem={renderHistoryItem}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={fetchEarnings} colors={["#28a745"]} tintColor="#28a745" />
                        }
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>Você ainda não possui entregas finalizadas.</Text>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    balanceContainer: {
        backgroundColor: '#1A1A1A',
        padding: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
    },
    balanceLabel: { color: '#ADB5BD', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    balanceValue: { color: '#FFF', fontSize: 36, fontWeight: 'bold', marginVertical: 10 },
    statsRow: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
    statItem: { alignItems: 'center', paddingHorizontal: 20 },
    statLabel: { color: '#6C757D', fontSize: 10, fontWeight: 'bold' },
    statValue: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    divider: { width: 1, height: 30, backgroundColor: '#333' },

    content: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    historyCard: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    iconCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#EFFFF4', justifyContent: 'center', alignItems: 'center' },
    historyTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    historyDate: { fontSize: 12, color: '#ADB5BD' },
    historyValue: { fontSize: 16, fontWeight: 'bold', color: '#28a745' },
    emptyText: { textAlign: 'center', color: '#ADB5BD', marginTop: 40 }
});